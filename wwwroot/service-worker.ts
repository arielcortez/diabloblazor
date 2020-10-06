﻿
self.addEventListener('install', (event: any) => event.waitUntil(onInstall(event)));
self.addEventListener('fetch', (event: any) => event.respondWith(onFetch(event)));

const cacheName: string = 'DiabloOfflineCache';
const gitHubPagesHostname: string = 'n-stefan.github.io';

async function onInstall(event: any): Promise<void> {
    //No PWA offline capability for GitHub Pages as initial caching takes too long
    //if (self.location.hostname === gitHubPagesHostname) return;

    console.info('Installing service worker');

    await caches.delete(cacheName);

    await caches.open(cacheName).then(cache => cache.addAll([
        '_framework/blazor.boot.json',
        '_framework/blazor.webassembly.js',
        '_framework/dotnet.5.0.0-rc.1.20451.14.js',
        '/',
        'dist/brotli.decode.min.js',
        'dist/external.min.css',
        'dist/external.min.js',
        'dist/diablo.min.css',
        'dist/diablo.min.js',
        'dist/diablo.js',
        'dist/diabloheavy.ttf',
        'dist/favicon.ico',
        'dist/icon-192.png',
        'dist/icon-512.png',
        'manifest.json',
        'appsettings.json',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0',
        //'spawn.mpq', //25MB
        'Diablo.wasm',
        'DiabloSpawn.wasm'
    ]));
}

async function onFetch(event: any): Promise<Response> {
    //No PWA offline capability for GitHub Pages as initial caching takes too long
    //if (self.location.hostname === gitHubPagesHostname) return null;

    if (event.request.method !== 'GET') return null;

    try {
        const fromNetwork = await fetch(event.request);
        if (fromNetwork) {
            console.info(`From the network: ${event.request.url}`);
            return fromNetwork;
        }
    } catch (e) {
        const shouldServeIndexHtml = event.request.mode === 'navigate';
        const request = shouldServeIndexHtml ? '/' : event.request;
        const cache = await caches.open(cacheName);
        const fromCache = await cache.match(request);
        if (fromCache) {
            console.info(`From the offline cache: ${event.request.url}`);
            return fromCache;
        }
        console.error(`Couldn't fetch ${event.request.url} from either the network or the offline cache`);
        return null;
    }
}
