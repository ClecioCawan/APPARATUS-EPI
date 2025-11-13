// Aguarda o HTML ser completamente carregado
document.addEventListener('DOMContentLoaded', () => {

    // --- DADOS DE EXEMPLO (Simulando um banco de dados) ---
    const TODAY = new Date();
    TODAY.setHours(0, 0, 0, 0);

    const getDateFromToday = (days) => {
      const date = new Date(TODAY);
      date.setDate(TODAY.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    let epiData = [

      {
        id: 1,
        nome: 'Capacete',
        categoria: 'Cabeca',
        lote: 'cp-122025',
        validade: '2024-10-01',
        quantidade: 100,
        estoqueMinimo: 50
      },

      {
        id: 2,
        nome: 'Luva Nitrílica',
        categoria: 'Maos',
        lote: 'ln-99874',
        validade: getDateFromToday(15),
        quantidade: 300,
        estoqueMinimo: 100
      },
      {
        id: 3,
        nome: 'Protetor de ouvi.',
        categoria: 'Audicao',
        lote: 'pa-3301',
        validade: getDateFromToday(365),
        quantidade: 40,
        estoqueMinimo: 50
      },
      {
        id: 4,
        nome: 'Óculos de Proteção',
        categoria: 'Olhos',
        lote: 'op-776',
        validade: getDateFromToday(200),
        quantidade: 100,
        estoqueMinimo: 50
      }
    ];

    // --- SELETORES DE ELEMENTOS ---
    const itemListContainer = document.querySelector('.item-list');
    const searchInput = document.querySelector('.search-section input');
    
    // Resumo
    const totalEl = document.querySelector('.summary-cards .card:nth-child(1) h2');
    const vencidosEl = document.querySelector('.summary-cards .card:nth-child(2) h2');
    const vencendoEl = document.querySelector('.summary-cards .card:nth-child(3) h2');
    const estoqueBaixoEl = document.querySelector('.summary-cards .card:nth-child(4) h2');

    // Modal
    const novoEpiBtn = document.getElementById('btn-novo-epi');
    const modal = document.getElementById('novoEpiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const novoEpiForm = document.getElementById('novoEpiForm');

    // === INÍCIO: NOVO SELETOR DE PDF ===
    const exportPdfBtn = document.getElementById('btn-export-pdf');
    // === FIM: NOVO SELETOR DE PDF ===


    // --- FUNÇÕES DE LÓGICA ---

    const formatDateBR = (isoDate) => {
        const date = new Date(isoDate + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    };

    const getEpiStatus = (item) => {
        const expiryDate = new Date(item.validade + 'T00:00:00');
        const diffTime = expiryDate - TODAY;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Vencido', className: 'tag-danger' };
        }
        if (diffDays <= 30) {
            return { text: 'Vencendo', className: 'tag-warning' };
        }
        if (item.quantidade <= item.estoqueMinimo) {
            return { text: 'Estoque Baixo', className: 'tag-info' };
        }
        return null;
    };

    const updateSummaryCards = () => {
        let vencidosCount = 0;
        let vencendoCount = 0;
        let estoqueBaixoCount = 0;

        epiData.forEach(item => {
            const status = getEpiStatus(item);
            if (status) {
                if (status.className === 'tag-danger') vencidosCount++;
                if (status.className === 'tag-warning') vencendoCount++;
                if (status.className === 'tag-info') estoqueBaixoCount++;
            }
        });

        totalEl.textContent = epiData.length;
        vencidosEl.textContent = vencidosCount;
        vencendoEl.textContent = vencendoCount;
        estoqueBaixoEl.textContent = estoqueBaixoCount;
    };

    const createEpiCardHTML = (item) => {
        const status = getEpiStatus(item);
        const statusTag = status
            ? `<span class="tag ${status.className}">${status.text}</span>`
            : '';

        return `
            <div class="card item-card" data-id="${item.id}">
                <div class="item-header">
                    <h3>${item.nome}</h3>
                    ${statusTag}
                </div>
                <div class="item-details">
                    <p><strong>Categoria:</strong> ${item.categoria}</p>
                    <p><strong>Lote:</strong> ${item.lote}</p>
                    <p><strong>Validade:</strong> ${formatDateBR(item.validade)}</p>
                    <p><strong>Quantidade:</strong> ${item.quantidade} unidades</p>
                    <p><strong>Estoque mínimo:</strong> ${item.estoqueMinimo} unidades</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit">
                        <i>✏️</i> Editar
                    </button>
                    <button class="btn btn-delete">
                        <i>🗑️</i> Excluir
                    </button>
                </div>
            </div>
        `;
    };

    const renderEpiList = (items) => {
        itemListContainer.innerHTML = ''; 
        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>Nenhum item encontrado.</p>';
            return;
        }
        items.forEach(item => {
            const cardHTML = createEpiCardHTML(item);
            itemListContainer.innerHTML += cardHTML;
        });
    };

    // --- FUNÇÕES DE EVENTOS ---

    // Modal
    const openModal = () => {
        modal.classList.add('active');
    };

    const closeModal = () => {
        modal.classList.remove('active');
        novoEpiForm.reset(); 
    };

    const handleFormSubmit = (event) => {
        event.preventDefault(); 
        const newItem = {
            id: Date.now(),
            nome: document.getElementById('nome').value,
            categoria: document.getElementById('categoria').value,
            lote: document.getElementById('lote').value,
            validade: document.getElementById('validade').value,
            quantidade: parseInt(document.getElementById('quantidade').value),
            estoqueMinimo: parseInt(document.getElementById('estoqueMinimo').value)
        };
        epiData.unshift(newItem); 
        const searchTerm = searchInput.value.toLowerCase();
        if(searchTerm) {
            handleSearch({ target: searchInput });
        } else {
            renderEpiList(epiData);
        }
        updateSummaryCards();
        closeModal();
    };
    
    // Busca
    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        
        const filteredItems = epiData.filter(item => 
            item.nome.toLowerCase().includes(searchTerm) ||
            item.categoria.toLowerCase().includes(searchTerm) ||
            item.lote.toLowerCase().includes(searchTerm)
        );
        
        renderEpiList(filteredItems);
    };

    // Ações do Item (Editar/Excluir)
    const handleItemClick = (event) => {
        const target = event.target;
        
        const deleteButton = target.closest('.btn-delete');
        if (deleteButton) {
            const card = target.closest('.item-card');
            const itemId = parseInt(card.dataset.id);
            
            if (confirm('Tem certeza que deseja excluir este item?')) {
                epiData = epiData.filter(item => item.id !== itemId);
                handleSearch({ target: searchInput });
                updateSummaryCards();
            }
        }
        
        const editButton = target.closest('.btn-edit');
        if (editButton) {
            const card = target.closest('.item-card');
            const itemId = parseInt(card.dataset.id);
            alert(`Função "Editar" para o item ID: ${itemId}\n(Não implementado)`);
        }
    };
    
    // Ações do Cabeçalho (Excel, etc)
    const handleHeaderClick = (event) => {
        // A lógica do PDF foi movida para seu próprio listener
        if (event.target.textContent.includes('Excel')) {
            alert('Função "Exportar Excel"\n(Não implementado)');
        }
    };

    // === INÍCIO: NOVA FUNÇÃO DE EXPORTAR PDF ===
    const handleExportPDF = () => {
        // Pega a classe jsPDF da janela global (window)
        const { jsPDF } = window.jspdf;

        // Cria um novo documento PDF
        const doc = new jsPDF();
        
        // Define o título do documento
        doc.setFontSize(18);
        doc.text("Relatório de EPIs - APPARATUS", 14, 22);
        doc.setFontSize(12);
        doc.text(`Data de geração: ${formatDateBR(new Date().toISOString().split('T')[0])}`, 14, 28);
        doc.setFontSize(12);
        doc.text("Lista completa de EPIs cadastrados no sistema.", 14, 34);

        // Define os cabeçalhos da tabela
        const tableColumn = ["Nome", "Categoria", "Lote", "Validade", "Qtd.", "Status"];
        
        // Mapeia os dados do 'epiData' para o formato de linhas da tabela
        const tableRows = [];
        epiData.forEach(item => {
            const status = getEpiStatus(item);
            const itemData = [
                item.nome,
                item.categoria,
                item.lote,
                formatDateBR(item.validade),
                item.quantidade,
                status ? status.text : 'OK' // Adiciona o status (Vencido, etc.) ou 'OK'
            ];
            tableRows.push(itemData);
        });

        // Adiciona a tabela ao documento
        // 'autoTable' é a função do plugin que importamos
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30, // Posição Y onde a tabela deve começar
            theme: 'striped', // 'striped', 'grid', 'plain'
            headStyles: {
                fillColor: [0, 123, 255] // Cor de fundo do cabeçalho (azul)
            }
        });

        // Gera o nome do arquivo com a data atual
        const date = new Date();
        const dateStr = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
        const fileName = `relatorio_epis_${dateStr}.pdf`;

        // Salva o arquivo PDF (inicia o download)
        doc.save(fileName);
    };
    // === FIM: NOVA FUNÇÃO DE EXPORTAR PDF ===


    // --- INICIALIZAÇÃO ---

    // Ouvintes de eventos
    searchInput.addEventListener('input', handleSearch);
    itemListContainer.addEventListener('click', handleItemClick);
    document.querySelector('header').addEventListener('click', handleHeaderClick);

    // Modal
    novoEpiBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    novoEpiForm.addEventListener('submit', handleFormSubmit);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // === INÍCIO: NOVO OUVINTE DO PDF ===
    exportPdfBtn.addEventListener('click', handleExportPDF);
    // === FIM: NOVO OUVINTE DO PDF ===

    // Renderização inicial
    renderEpiList(epiData);
    updateSummaryCards();
});