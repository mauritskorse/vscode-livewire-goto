'use strict';

import {
    Hover, HoverProvider as vsHoverProvider, MarkdownString, Position, ProviderResult, TextDocument, workspace
} from 'vscode';
import * as util from '../util';
import DocumentLinkProvider from './documentLinkProvider';

export default class HoverProvider implements vsHoverProvider {
    provideHover(document: TextDocument, position: Position): ProviderResult<Hover> {
        let ranges = document.getWordRangeAtPosition(position, util.regexJumpFile);

        if (!ranges) {
            return;
        }

        const wsPath = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath;

        if (!wsPath) {
            return;
        }

        // const cacheMap = util.getLivewireCacheMap(wsPath);

        const text = document.getText(ranges);
        const matches = text.matchAll(util.regexJumpFile);

        for (const match of matches) {
            const matchedPath = match[5];
            const matchedModule = match[4] ? match[4] : false;
            const jumpPath =  util.convertToFilePath(wsPath, matchedPath, matchedModule);

            const jumpPathShow = jumpPath.replace(wsPath + '/', '');

            const markdown = '\`class:\`' + `[${jumpPathShow}](${jumpPath}) \n`;

            return new Hover(new MarkdownString(markdown));
        }
    }
}
