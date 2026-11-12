// ===================================================
// SERVICE WORKER: faz o app funcionar sem internet
// ===================================================
// Estratégia "internet primeiro":
//   - COM internet: sempre busca a versão mais nova no GitHub
//     e aproveita pra atualizar a cópia guardada no celular
//   - SEM internet: usa a cópia guardada
//
// Assim toda atualização aparece sozinha na próxima vez que você
// abrir o app com internet, sem precisar fechar e abrir várias vezes.
//
// Ainda vale mudar a versão aqui quando atualizar (v5 → v6...),
// pra limpar as cópias antigas.
const VERSAO = 'hefesto-v5';

const ARQUIVOS = [
  './',
  './index.html',
  './style.css',
  './biblioteca.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// 1. INSTALAR: guarda todos os arquivos
self.addEventListener('install', function (evento) {
  evento.waitUntil(
    caches.open(VERSAO).then(function (cache) {
      // cache: 'reload' = ignora o cache do navegador e baixa direto do GitHub
      // (era aqui o problema: antes ele podia guardar a versão velha)
      const pedidos = ARQUIVOS.map(function (url) {
        return new Request(url, { cache: 'reload' });
      });
      return cache.addAll(pedidos);
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

// 3. BUSCAR: tenta a internet primeiro; se falhar (offline), usa a cópia
self.addEventListener('fetch', function (evento) {
  if (evento.request.method !== 'GET') return;

  evento.respondWith(
    fetch(evento.request, { cache: 'no-cache' })
      .then(function (resposta) {
        // Deu certo: guarda uma cópia atualizada pra usar offline
        const copia = resposta.clone();
        caches.open(VERSAO).then(function (cache) {
          cache.put(evento.request, copia);
        });
        return resposta;
      })
      .catch(function () {
        // Sem internet: entrega a cópia guardada
        return caches.match(evento.request, { ignoreSearch: true });
      })
  );
});