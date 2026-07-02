<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Facturación Local</title>
  <style>
    :root {
      --bg: #f4f6f9;
      --surface: #ffffff;
      --text: #2c3e50;
      --text-soft: #7f8c8d;
      --primary: #3498db;
      --primary-hover: #2980b9;
      --success: #2ecc71;
      --danger: #e74c3c;
      --warning: #f1c40f;
      --border: #e2e8f0;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; }
    
    header { background: var(--surface); padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    h1 { font-size: 24px; }
    .subtitle { color: var(--text-soft); font-size: 14px; }

    nav { display: flex; gap: 10px; margin-bottom: 20px; }
    .navbtn { background: #e2e8f0; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; color: var(--text); transition: all 0.2s; }
    .navbtn.is-active { background: var(--primary); color: white; }

    .view { display: none; background: var(--surface); padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .view.is-active { display: block; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
    
    label { font-size: 14px; font-weight: 600; color: var(--text); }
    input, select, textarea { padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; width: 100%; }
    input:focus, select:focus, textarea:focus { outline: 2px solid var(--primary); }

    .btn { background: var(--primary); color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
    .btn:hover { background: var(--primary-hover); }
    .btn--success { background: var(--success); }
    .btn--success:hover { background: #27ae60; }
    .btn--danger { background: var(--danger); }
    .btn--danger:hover { background: #c0392b; }
    .btn--soft { background: #e2e8f0; color: var(--text); }
    .btn--soft:hover { background: #cbd5e1; }

    table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border); }
    th { background: #f8fafc; font-weight: 600; }
    .mono { font-family: monospace; font-size: 15px; }

    /* Totales y Líneas */
    .totals-box { width: 300px; margin-left: auto; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid var(--border); }
    .totals-box div { display: flex; justify-content: space-between; padding: 5px 0; }
    .totals-box .grand { font-weight: bold; font-size: 18px; border-top: 2px solid var(--border); margin-top: 5px; padding-top: 10px; }

    /* Indicadores / Stats */
    .stat-card { background: var(--surface); padding: 20px; border-radius: 8px; border: 1px solid var(--border); text-align: center; }
    .stat-card h3 { font-size: 28px; color: var(--primary); margin-top: 5px; }

    /* Badges */
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; }
    .badge--paid { background: #d4edda; color: #155724; }
    .badge--pending { background: #fff3cd; color: #856404; }
    .badge--overdue { background: #f8d7da; color: #721c24; }

    /* Modal */
    .modal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 1000; }
    .modal.is-open { opacity: 1; pointer-events: auto; }
    .modal-content { background: white; padding: 30px; border-radius: 8px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 15px; }

    /* Estilos Vista Impresión Factura Documento */
    #invoiceDoc table { margin-top: 20px; }
    .idoc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding: 15px 0; border-top: 1px dashed var(--border); border-bottom: 1px dashed var(--border); }
    .idoc-totals { width: 250px; margin-left: auto; margin-top: 15px; }
    .idoc-totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .idoc-totals .grand { font-weight: bold; border-top: 1px solid #000; }

    .iconbtn { background: none; border: none; color: var(--danger); cursor: pointer; text-decoration: underline; }
    .rowdel { background: none; border: none; color: var(--danger); font-size: 20px; cursor: pointer; }
    .empty-msg { text-align: center; color: var(--text-soft); padding: 20px; display: none; }

    @media print {
      body * { visibility: hidden; }
      #invoiceDoc, #invoiceDoc * { visibility: visible; }
      #invoiceDoc { position: absolute; left: 0; top: 0; width: 100%; }
      .modal { position: absolute; background: white; }
      .modal-actions, .close-modal-x { display: none !important; }
    }
  </style>
</head>
<body>

  <header>
    <div>
      <h1 id="bizName">Mi Negocio</h1>
      <p class="subtitle" id="bizTagline">Sistema de facturación</p>
    </div>
    <div>
      <span class="subtitle">Próximo Folio: </span><strong id="folioTag" class="mono">...</strong>
    </div>
  </header>

  <nav>
    <button class="navbtn is-active" data-view="nueva">Nueva Factura</button>
    <button class="navbtn" data-view="registro">Registro de Facturas</button>
    <button class="navbtn" data-view="clientes">Clientes</button>
    <button class="navbtn" data-view="config">Configuración</button>
  </nav>

  <div id="view-nueva" class="view is-active">
    <div class="grid-2">
      <div class="form-group">
        <label for="clientSelect">Cliente</label>
        <select id="clientSelect"><option value="">— Seleccionar cliente —</option></select>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label for="invDate">Fecha Emisión</label>
          <input type="date" id="invDate">
        </div>
        <div class="form-group">
          <label for="invDue">Fecha Vencimiento</label>
          <input type="date" id="invDue">
        </div>
      </div>
    </div>

    <h3>Conceptos / Artículos</h3>
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="width: 100px;">Cant.</th>
          <th style="width: 130px;">Precio Unit.</th>
          <th style="width: 130px;">Importe</th>
          <th style="width: 40px;"></th>
        </tr>
      </thead>
      <tbody id="itemsBody">
        </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <button class="btn btn--soft" id="addItemBtn">+ Agregar Línea</button>
      
      <div class="totals-box">
        <div><span>Subtotal:</span><span id="sumSubtotal">$0.00</span></div>
        <div style="align-items: center;">
          <span>Impuesto (%):</span>
          <input type="number" id="taxRate" value="16" style="width: 70px; padding: 4px; text-align: right;">
        </div>
        <div><span>Impuesto IVA:</span><span id="sumTax">$0.00</span></div>
        <div class="grand"><span>Total:</span><span id="sumTotal">$0.00</span></div>
      </div>
    </div>

    <div class="form-group" style="margin-top: 15px;">
      <label for="invNote">Notas / Observaciones de la factura</label>
      <textarea id="invNote" rows="2" placeholder="Términos de pago, datos bancarios, etc."></textarea>
    </div>

    <div style="margin-top: 20px; display: flex; gap: 10px;">
      <button class="btn btn--success" id="saveInvoiceBtn">Guardar y Emitir Factura</button>
      <button class="btn btn--soft btn--danger" id="clearInvoiceBtn" style="color:white">Limpiar Campos</button>
    </div>
  </div>

  <div id="view-registro" class="view">
    <div class="grid-3">
      <div class="stat-card"><h5>Total Facturado</h5><h3 id="statTotal">$0.00</h3></div>
      <div class="stat-card"><h5>Por Cobrar</h5><h3 id="statPending">$0.00</h3></div>
      <div class="stat-card"><h5>Total Comprobantes</h5><h3 id="statCount">0</h3></div>
    </div>

    <div class="form-group">
      <input type="text" id="searchInvoices" placeholder="Buscar por número de folio o nombre de cliente...">
    </div>

    <table>
      <thead>
        <tr>
          <th>Folio</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="registryBody"></tbody>
    </table>
    <div id="registryEmpty" class="empty-msg">No se encontraron facturas en el historial.</div>
  </div>

  <div id="view-clientes" class="view">
    <h3>Añadir Nuevo Cliente</h3>
    <div class="grid-2" style="margin-top: 15px;">
      <div class="form-group"><label>Nombre o Razón Social *</label><input type="text" id="cName"></div>
      <div class="form-group"><label>ID Fiscal / RFC / RUT</label><input type="text" id="cTax"></div>
      <div class="form-group"><label>Correo Electrónico</label><input type="email" id="cEmail"></div>
      <div class="form-group"><label>Teléfono</label><input type="text" id="cPhone"></div>
    </div>
    <div class="form-group"><label>Dirección Física</label><input type="text" id="cAddress"></div>
    <button class="btn" id="addClientBtn">Guardar Cliente</button>

    <h3 style="margin-top: 30px;">Directorio de Clientes</h3>
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>ID Fiscal</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody id="clientsBody"></tbody>
    </table>
    <div id="clientsEmpty" class="empty-msg">No hay clientes registrados todavía.</div>
  </div>

  <div id="view-config" class="view">
    <h3>Configuración de Emisor Financiero</h3>
    <div class="grid-2" style="margin-top: 15px;">
      <div class="form-group"><label>Nombre Comercial</label><input type="text" id="cfgName"></div>
      <div class="form-group"><label>Slogan o Actividad</label><input type="text" id="cfgTagline"></div>
      <div class="form-group"><label>Email de Contacto</label><input type="email" id="cfgEmail"></div>
      <div class="form-group"><label>Teléfono de Atención</label><input type="text" id="cfgPhone"></div>
      <div class="form-group"><label>Símbolo de Moneda</label><input type="text" id="cfgCurrency" value="$"></div>
      <div class="form-group">
        <label>Prefijo del Folio e Inicio</label>
        <div style="display:flex; gap: 5px">
          <input type="text" id="cfgPrefix" value="F-">
          <span style="align-self: center; color: var(--text-soft);" id="nextFolio">F-0001</span>
        </div>
      </div>
    </div>
    <button class="btn btn--success" id="saveCfgBtn">Guardar Configuración</button>
  </div>

  <div id="invoiceModal" class="modal">
    <div class="modal-content">
      <div id="invoiceDoc"></div>
      
      <div class="modal-actions">
        <button class="btn btn--soft" id="markPaidBtn">Marcar como pagada</button>
        <button class="btn" id="printBtn">Imprimir Factura</button>
        <button class="btn btn--soft" id="closeModalBtn">Cerrar</button>
      </div>
    </div>
  </div>

  <script>
    // Tu código JavaScript original va aquí de manera íntegra.
    // (Por brevedad, ya incluye todas las conexiones con el DOM de arriba).
    
    /* =========================================================
       SISTEMA DE FACTURACIÓN — lógica principal
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
            <strong>Facturar a</strong><br>
            ${escapeHtml(inv.clientName)}
          </div>
          <div>
            <strong>Folio:</strong> <span class="mono">${inv.folio}</span><br>
            Fecha: ${inv.date}<br>
            Vence: ${inv.due||'—'}<br>
            Estado: <span class="badge ${st.cls}">${st.label}</span>
          </div>
        </div>

        ${inv.note ? `<p style="font-size:13px;color:var(--text-soft);margin-bottom:10px;">Nota: ${escapeHtml(inv.note)}</p>` : ''}

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
  </script>
</body>
</html>
