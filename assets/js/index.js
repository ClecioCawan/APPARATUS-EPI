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
        nome: 'Protetor Auricular',
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

    // === INÍCIO: NOVOS SELETORES DO MODAL ===
    const novoEpiBtn = document.getElementById('btn-novo-epi');
    const modal = document.getElementById('novoEpiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const novoEpiForm = document.getElementById('novoEpiForm');


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
            id: Date.now(), // Gera um ID único simples
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
    

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        
        const filteredItems = epiData.filter(item => 
            item.nome.toLowerCase().includes(searchTerm) ||
            item.categoria.toLowerCase().includes(searchTerm) ||
            item.lote.toLowerCase().includes(searchTerm)
        );
        
        renderEpiList(filteredItems);
    };

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
    
    const handleHeaderClick = (event) => {
        
        if (event.target.textContent.includes('PDF')) {
            alert('Função "Exportar PDF"\n(Não implementado)');
        }
        if (event.target.textContent.includes('Excel')) {
            alert('Função "Exportar Excel"\n(Não implementado)');
        }
    };

    

    
    searchInput.addEventListener('input', handleSearch);
    itemListContainer.addEventListener('click', handleItemClick);
    document.querySelector('header').addEventListener('click', handleHeaderClick);

    
    novoEpiBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    novoEpiForm.addEventListener('submit', handleFormSubmit);

    
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
   

    
    renderEpiList(epiData);
    updateSummaryCards();
});