'use strict';

import * as fs from 'fs';
import path = require('path');
import { workspace } from 'vscode';

// TODO: move it to config
// export const regexJumpFile = new RegExp('@livewire\\([\'\"](.*?)[\'\"]\\)', 'g');
//export const regexJumpFile = /((@livewire\([ \t\n]{0,}[\'\"])|<livewire:)(.*?)([\'\"][\),]|([ \t\n]|>))/g;
export const regexJumpFile = /((@livewire\([ \t\n]{0,}[\'\"])|<livewire:)((.*?)[\:]{2})?(.*?)([\'\"][\),]|([ \t\n]|>))/g;
export const regexCacheMap = new RegExp('\'(.*?)\' \=\> \'(.*?)\'', 'g');

interface CacheMap {
    [key: string]: string
}

export function getLivewireCacheMap(workspacePath: string | undefined): CacheMap {
    let map: CacheMap = {};

    const cacheFile = workspacePath + '/bootstrap/cache/livewire-components.php';

    if (!fs.existsSync(cacheFile)) {return map;}

    const content = fs.readFileSync(cacheFile, 'utf-8');
    const matches = content.matchAll(regexCacheMap);

    for (const match of matches) {
        map[match[1]] = workspacePath + '/' + convertNamespaceToFilePath(match[2]);
    }

    return map;
}

export function convertNamespaceToFilePath(namespace: string): string {
    // for now, we assume that the namespace is same as the folder structure

    // this replace App\\Http to App/Http. need backslash 8 times, weird.
    namespace = namespace.replace(new RegExp("\\\\\\\\", 'g'), '/');
    // this replace App to app.
    namespace = namespace.replace('App', 'app');

    return namespace + '.php';
}

export function convertToFilePath(wsPath:string, s: string, module: string|boolean): string {
    s = (s.replace(/-./g, x=>x[1].toUpperCase())).replace(/\../g, x=>'/' + x[1].toUpperCase());
    s = s[0].toUpperCase() + s.substring(1) + ".php";
    
    let pathComponents;
    if (typeof module === 'string') {
        pathComponents = workspace.getConfiguration('livewire-goto-updated-3').modules.pathComponents;
        //first letter of module name to uppercase
        module = module.charAt(0).toUpperCase() + module.slice(1);
        pathComponents = pathComponents.replace('{module}', module);
    }
    else {
        pathComponents = workspace.getConfiguration('livewire-goto-updated-3').pathComponents;
    }

    if (!pathComponents.endsWith('/')) {
        pathComponents += '/';
    }

    return wsPath + pathComponents + s;
}
