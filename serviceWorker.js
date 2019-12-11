/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// I changed the formatting and specified my files to cache

const cacheName = 'static-cache-v1';
const filesToCache = [
	'/manifest.json',
	'/offline.html',
	'/favicon.png',
	'/favicon-16x16.png',
	'/favicon-32x32.png',
	'/favicon.ico',
	'/android-chrome-192x192.png',
	'/android-chrome-512x512.png',
	'/maskable-192x192.png',
	'/maskable-512x512.png',
	'/apple-touch-icon.png',
	'/browserconfig.xml',
	'/mstile-150x150.png',
	'/safari-pinned-tab.svg'
];

self.addEventListener('install', function(e) {
	// Precache static resources here.
	e.waitUntil(caches.open(cacheName).then(function(cache) {
		return cache.addAll(filesToCache);
	}););
	self.skipWaiting();
});

self.addEventListener('activate', function(e) {
	// Remove previous cached data from disk.
	caches.keys().then(function(keyList) {
		return Promise.all(keyList.map(function(key) {
			if (key !== cacheName) {
				return caches.delete(key);
			}
		}));
	});
	self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	// Add fetch event handler here.
	if (e.request.mode !== 'navigate') {
		// Not a page navigation, bail.
		return;
	}
	e.respondWith(fetch(e.request).catch(function() {
		return caches.open(cacheName).then(function(cache) {
			return cache.match('offline.html');
		});
	}));
});