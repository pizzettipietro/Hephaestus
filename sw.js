// ===================================================
// SERVICE WORKER: faz o app funcionar sem internet
// ===================================================
// Ele roda "por trás" do app e guarda uma cópia dos arquivos no celular.
// Quando o app pede um arquivo, o service worker entrega a cópia guardada.
//
// ⚠️ IMPORTANTE: toda vez que você mudar algum arquivo do app,
// aumente a versão aqui (v1 → v2 → v3...). É assim que o celular
// percebe que tem atualização e baixa os arquivos novos.
const VERSAO = 'hefesto-v3';

// Lista dos arquivos que o app precisa pra funcionar
const ARQUIVOS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 1. INSTALAR: baixa e guarda todos os arquivos
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(VERSAO).then(function (cache) {
      return cache.addAll(ARQUIVOS);
    })
  );
  self.skipWaiting(); // ativa a versão nova sem esperar
});

// 2. ATIVAR: apaga as cópias de versões antigas
self.addEventListener('activate', function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== VERSAO; })
          .map(function (nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

// 3. BUSCAR: quando o app pede um arquivo, entrega a cópia guardada.
//    Se não tiver cópia, busca na internet.
self.addEventListener('fetch', function (evento) {
  evento.respondWith(
    caches.match(evento.request).then(function (copia) {
      return copia || fetch(evento.request);
    })
  );
});
