/* =========================================================
   SISTEMA DE FACTURACIÓN — lógica principal
   Persistencia: localStorage (funciona al abrir el archivo
   en un navegador normal o al publicarlo en GitHub Pages).
   ========================================================= */

const STORAGE_KEY = {
  clients: 'fact_clients',
  invoices: 'fact_invoices',
  config: 'fact_config',
  folio: 'fact_folio'
};

const store = {
  get(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  },
  set(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }
    catch(e){ console.error('No se pudo guardar', e); }
  }
};

let clients  = store.get(STORAGE_KEY.clients, []);
let invoices = store.get(STORAGE_KEY.invoices, []);
let config   = store.get(STORAGE_KEY.config, {
  name:'Mi Negocio', tagline:'Sistema de facturación',
  email:'', phone:'', currency:'$', prefix:'F-'
});
let nextFolio = store.get(STORAGE_KEY.folio, 1);

let currentItems = [];   // líneas de la factura en edición
let itemSeq = 0;
let activeInvoiceId = null; // factura mostrada en el modal

const fmt = n => `${config.currency}${(Number(n)||0).toFixed(2)}`;
const pad = n => String(n).padStart(4,'0');
const folioLabel = n => `${config.prefix}${pad(n)}`;
const todayISO = () => new Date().toISOString().slice(0,10);

/* =========================================================
   NAVEGACIÓN ENTRE VISTAS
   ========================================================= */
document.querySelectorAll('.navbtn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('is-active'));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById('view-'+btn.dataset.view).classList.add('is-active');
    if(btn.dataset.view === 'registro') renderRegistry();
    if(btn.dataset.view === 'clientes') renderClients();
  });
});

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
function init(){
  document.getElementById('invDate').value = todayISO();
  const due = new Date(); due.setDate(due.getDate()+15);
  document.getElementById('invDue').value = due.toISOString().slice(0,10);

  applyConfigToUI();
  renderClientSelect();
  renderClients();
  renderRegistry();
  updateStats();
  addItem(); // primera línea vacía

  document.getElementById('folioTag').textContent = folioLabel(nextFolio);
  document.getElementById('nextFolio').textContent = folioLabel(nextFolio);
}

function applyConfigToUI(){
  document.getElementById('bizName').textContent = config.name || 'Mi Negocio';
  document.getElementById('bizTagline').textContent = config.tagline || '';
  document.getElementById('cfgName').value = config.name || '';
  document.getElementById('cfgTagline').value = config.tagline || '';
  document.getElementById('cfgEmail').value = config.email || '';
  document.getElementById('cfgPhone').value = config.phone || '';
  document.getElementById('cfgCurrency').value = config.currency || '$';
  document.getElementById('cfgPrefix').value = config.prefix || 'F-';
}

/* =========================================================
   CLIENTES
   ========================================================= */
document.getElementById('addClientBtn').addEventListener('click', ()=>{
  const name = document.getElementById('cName').value.trim();
  if(!name){ alert('Escribe al menos el nombre del cliente.'); return; }
  const client = {
    id: 'c'+Date.now(),
    name,
    tax: document.getElementById('cTax').value.trim(),
    email: document.getElementById('cEmail').value.trim(),
    phone: document.getElementById('cPhone').value.trim(),
    address: document.getElementById('cAddress').value.trim()
  };
  clients.push(client);
  store.set(STORAGE_KEY.clients, clients);
  ['cName','cTax','cEmail','cPhone','cAddress'].forEach(id=>document.getElementById(id).value='');
  renderClients();
  renderClientSelect();
});

function renderClients(){
  const body = document.getElementById('clientsBody');
  const empty = document.getElementById('clientsEmpty');
  body.innerHTML = '';
  empty.style.display = clients.length ? 'none' : 'block';
  clients.forEach(c=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.tax||'—')}</td>
      <td>${escapeHtml(c.email||'—')}</td>
      <td>${escapeHtml(c.phone||'—')}</td>
      <td><button class="iconbtn" data-id="${c.id}">Eliminar</button></td>`;
    tr.querySelector('.iconbtn').addEventListener('click', ()=>{
      if(!confirm(`¿Eliminar a ${c.name}?`)) return;
      clients = clients.filter(x=>x.id!==c.id);
      store.set(STORAGE_KEY.clients, clients);
      renderClients(); renderClientSelect();
    });
    body.appendChild(tr);
  });
}

function renderClientSelect(){
  const sel = document.getElementById('clientSelect');
  const current = sel.value;
  sel.innerHTML = '<option value="">— Seleccionar cliente —</option>' +
    clients.map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  sel.value = current;
}

/* =========================================================
   LÍNEAS DE FACTURA
   ========================================================= */
document.getElementById('addItemBtn').addEventListener('click', addItem);

function addItem(){
  const id = 'i'+(itemSeq++);
  currentItems.push({id, desc:'', qty:1, price:0});
  renderItems();
}

function renderItems(){
  const body = document.getElementById('itemsBody');
  body.innerHTML = '';
  currentItems.forEach(item=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" placeholder="Descripción del producto o servicio" value="${escapeHtml(item.desc)}" data-field="desc"></td>
      <td><input type="number" min="0" step="1" value="${item.qty}" data-field="qty"></td>
      <td><input type="number" min="0" step="0.01" value="${item.price}" data-field="price"></td>
      <td class="rowtotal mono">${fmt(item.qty*item.price)}</td>
      <td><button class="rowdel" title="Eliminar línea">&times;</button></td>`;

  tr.querySelectorAll('input').forEach(inp=>{
  inp.addEventListener('input', ()=>{
    const field = inp.dataset.field;
    item[field] = field==='desc' ? inp.value : Number(inp.value)||0;
    tr.querySelector('.rowtotal').textContent = fmt(item.qty*item.price);
    updateTotals();
  });
});
    tr.querySelector('.rowdel').addEventListener('click', ()=>{
      currentItems = currentItems.filter(x=>x.id!==item.id);
      if(currentItems.length===0) addItem(); else renderItems();
      updateTotals();
    });
    body.appendChild(tr);
  });
  updateTotals();
}

document.getElementById('taxRate').addEventListener('input', updateTotals);

function calcTotals(){
  const subtotal = currentItems.reduce((s,i)=>s+i.qty*i.price,0);
  const rate = Number(document.getElementById('taxRate').value)||0;
  const tax = subtotal * (rate/100);
  return { subtotal, tax, total: subtotal+tax, rate };
}

function updateTotals(){
  const {subtotal, tax, total} = calcTotals();
  document.getElementById('sumSubtotal').textContent = fmt(subtotal);
  document.getElementById('sumTax').textContent = fmt(tax);
  document.getElementById('sumTotal').textContent = fmt(total);
}

/* =========================================================
   GUARDAR / LIMPIAR FACTURA
   ========================================================= */
document.getElementById('clearInvoiceBtn').addEventListener('click', resetInvoiceForm);

function resetInvoiceForm(){
  currentItems = [];
  document.getElementById('clientSelect').value = '';
  document.getElementById('invNote').value = '';
  document.getElementById('invDate').value = todayISO();
  const due = new Date(); due.setDate(due.getDate()+15);
  document.getElementById('invDue').value = due.toISOString().slice(0,10);
  document.getElementById('taxRate').value = 16;
  addItem();
}

document.getElementById('saveInvoiceBtn').addEventListener('click', ()=>{
  const clientId = document.getElementById('clientSelect').value;
  if(!clientId){ alert('Selecciona un cliente.'); return; }
  const validItems = currentItems.filter(i=>i.desc.trim() && i.qty>0);
  if(validItems.length===0){ alert('Agrega al menos una línea con descripción y cantidad.'); return; }

  const client = clients.find(c=>c.id===clientId);
  const {subtotal, tax, total, rate} = calcTotals();

  const invoice = {
    id: 'inv'+Date.now(),
    folio: folioLabel(nextFolio),
    clientId,
    clientName: client.name,
    date: document.getElementById('invDate').value,
    due: document.getElementById('invDue').value,
    note: document.getElementById('invNote').value.trim(),
    items: validItems,
    taxRate: rate,
    subtotal, tax, total,
    status: 'pending' // pending | paid
  };

  invoices.unshift(invoice);
  nextFolio += 1;
  store.set(STORAGE_KEY.invoices, invoices);
  store.set(STORAGE_KEY.folio, nextFolio);

  document.getElementById('folioTag').textContent = folioLabel(nextFolio);
  document.getElementById('nextFolio').textContent = folioLabel(nextFolio);

  resetInvoiceForm();
  updateStats();
  openInvoiceModal(invoice.id);
});

/* =========================================================
   REGISTRO DE FACTURAS
   ========================================================= */
document.getElementById('searchInvoices').addEventListener('input', renderRegistry);

function invoiceStatus(inv){
  if(inv.status==='paid') return {label:'Pagada', cls:'badge--paid'};
  if(inv.due && inv.due < todayISO()) return {label:'Vencida', cls:'badge--overdue'};
  return {label:'Pendiente', cls:'badge--pending'};
}

function renderRegistry(){
  const q = (document.getElementById('searchInvoices').value||'').toLowerCase();
  const body = document.getElementById('registryBody');
  const empty = document.getElementById('registryEmpty');
  const filtered = invoices.filter(inv =>
    inv.folio.toLowerCase().includes(q) || inv.clientName.toLowerCase().includes(q));

  body.innerHTML = '';
  empty.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach(inv=>{
    const st = invoiceStatus(inv);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono">${inv.folio}</td>
      <td>${escapeHtml(inv.clientName)}</td>
      <td>${inv.date}</td>
      <td class="mono">${fmt(inv.total)}</td>
      <td><span class="badge ${st.cls}">${st.label}</span></td>
      <td><button class="iconbtn" data-id="${inv.id}">Ver</button></td>`;
    tr.querySelector('.iconbtn').addEventListener('click', ()=>openInvoiceModal(inv.id));
    body.appendChild(tr);
  });
}

function updateStats(){
  const total = invoices.reduce((s,i)=>s+i.total,0);
  const pending = invoices.filter(i=>i.status!=='paid').reduce((s,i)=>s+i.total,0);
  document.getElementById('statTotal').textContent = fmt(total);
  document.getElementById('statPending').textContent = fmt(pending);
  document.getElementById('statCount').textContent = invoices.length;
}

/* =========================================================
   MODAL DE FACTURA (VER / IMPRIMIR / MARCAR PAGADA)
   ========================================================= */
function openInvoiceModal(id){
  const inv = invoices.find(i=>i.id===id);
  if(!inv) return;
  activeInvoiceId = id;
  const st = invoiceStatus(inv);

  document.getElementById('invoiceDoc').innerHTML = `
    <h3>${escapeHtml(config.name)}</h3>
    <p class="idoc-meta">${escapeHtml(config.tagline||'')} ${config.email? '· '+escapeHtml(config.email):''} ${config.phone? '· '+escapeHtml(config.phone):''}</p>

    <div class="idoc-grid">
      <div>
        <strong>Facturar a</strong>
        ${escapeHtml(inv.clientName)}
      </div>
      <div>
        <strong>Folio</strong>
        <span class="mono">${inv.folio}</span><br>
        Fecha: ${inv.date}<br>
        Vence: ${inv.due||'—'}<br>
        <span class="badge ${st.cls}">${st.label}</span>
      </div>
    </div>

    ${inv.note ? `<p style="font-size:13px;color:var(--ink-soft)">Nota: ${escapeHtml(inv.note)}</p>` : ''}

    <table>
      <thead><tr><th>Descripción</th><th style="text-align:right">Cant.</th><th style="text-align:right">Precio</th><th style="text-align:right">Importe</th></tr></thead>
      <tbody>
        ${inv.items.map(i=>`
          <tr>
            <td>${escapeHtml(i.desc)}</td>
            <td style="text-align:right">${i.qty}</td>
            <td style="text-align:right">${fmt(i.price)}</td>
            <td style="text-align:right">${fmt(i.qty*i.price)}</td>
          </tr>`).join('')}
      </tbody>
    </table>

    <div class="idoc-totals">
      <div class="row"><span>Subtotal</span><span>${fmt(inv.subtotal)}</span></div>
      <div class="row"><span>Impuesto (${inv.taxRate}%)</span><span>${fmt(inv.tax)}</span></div>
      <div class="row grand"><span>Total</span><span>${fmt(inv.total)}</span></div>
    </div>
  `;

  const paidBtn = document.getElementById('markPaidBtn');
  paidBtn.textContent = inv.status==='paid' ? 'Marcar como pendiente' : 'Marcar como pagada';
  document.getElementById('invoiceModal').classList.add('is-open');
}

document.getElementById('closeModalBtn').addEventListener('click', ()=>{
  document.getElementById('invoiceModal').classList.remove('is-open');
});
document.getElementById('invoiceModal').addEventListener('click', e=>{
  if(e.target.id==='invoiceModal') e.currentTarget.classList.remove('is-open');
});

document.getElementById('markPaidBtn').addEventListener('click', ()=>{
  const inv = invoices.find(i=>i.id===activeInvoiceId);
  if(!inv) return;
  inv.status = inv.status==='paid' ? 'pending' : 'paid';
  store.set(STORAGE_KEY.invoices, invoices);
  updateStats();
  renderRegistry();
  openInvoiceModal(inv.id);
});

document.getElementById('printBtn').addEventListener('click', ()=> window.print());

/* =========================================================
   CONFIGURACIÓN DEL NEGOCIO
   ========================================================= */
document.getElementById('saveCfgBtn').addEventListener('click', ()=>{
  config = {
    name: document.getElementById('cfgName').value.trim() || 'Mi Negocio',
    tagline: document.getElementById('cfgTagline').value.trim(),
    email: document.getElementById('cfgEmail').value.trim(),
    phone: document.getElementById('cfgPhone').value.trim(),
    currency: document.getElementById('cfgCurrency').value.trim() || '$',
    prefix: document.getElementById('cfgPrefix').value.trim()
  };
  store.set(STORAGE_KEY.config, config);
  applyConfigToUI();
  document.getElementById('folioTag').textContent = folioLabel(nextFolio);
  document.getElementById('nextFolio').textContent = folioLabel(nextFolio);
  renderItems();
  renderRegistry();
  updateStats();
  alert('Datos del negocio guardados.');
});

/* =========================================================
   UTIL
   ========================================================= */
function escapeHtml(str){
  return String(str??'').replace(/[&<>"']/g, m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

init();
