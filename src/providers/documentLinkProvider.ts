'use strict';

import {
    DocumentLink, DocumentLinkProvider as vsDocumentLinkProvider, Position, ProviderResult, Range, TextDocument, Uri, workspace
} from 'vscode';
import * as util from '../util';

export default class DocumentLinkProvider implements vsDocumentLinkProvider {
    provideDocumentLinks(document: TextDocument): ProviderResult<DocumentLink[]> {
        let documentLinks: DocumentLink[] = [];

        const wsPath = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;

        if (!wsPath) {
            return;
        }

        // const cacheMap = util.getLivewireCacheMap(wsPath);
        for (let index = 0; index < document.lineCount; index++) {
            const line = document.lineAt(index);
            const matches = line.text.matchAll(util.regexJumpFile);

            for (const match of matches) {
                // if match[3] is not undefined, then we have a module path
                // else we have a regular path
                // group 4 is the module path
                // group 5 is the regular path

                const matchedModule = match[4] ? match[4] : false;
                const matchedPath = match[5];

                const startColumn = new Position(
                    line.lineNumber,
                    line.text.indexOf(matchedPath)
                );
                const endColumn = startColumn.translate(0, matchedPath.length);

                const jumpPath = util.convertToFilePath(wsPath, matchedPath, matchedModule);

                if (jumpPath === undefined) {
                    continue;
                }

                documentLinks.push(
                    new DocumentLink(
                        new Range(startColumn, endColumn), Uri.file(jumpPath),
                    )
                );
            }
        }

        return documentLinks;
    }
}
