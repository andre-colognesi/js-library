function callToast(message,type,callback){
    let bgColor;
    if(type == 'success'){
        bgColor =  "#33cc33"
    }else if(type == 'warning'){
        bgColor = '#e6e600'
    }else if(type == "danger"){
        bgColor = "#ff9980";
    }
        let Toast = Toastify({
      text: message,
      duration: 5000,
      backgroundColor: bgColor
    });
    
    Toast.showToast();
}

HTMLElement.prototype.autocompleter = function(obj = {
    url: false, 
    returnType: function(){},
    selected: function(obj){},
    selectedId: null,
    }){
    //console.log(obj);
    this.autocomplete = "off";

    let list =  document.createElement('ul');
    obj.removeActive = function(){
        list.childNodes.forEach(e => {
            e.classList.remove('active');
        })
    };
    obj.close = function () {
        obj.selectedItem = undefined;
        obj.selectedPosition = undefined;
        list.innerHTML = "";
    }

    list.classList.add('list-group');
    list.style.zIndex = 2;
    list.style.position = "absolute";
    list.style.width = "90%"
    list.offsetWidth = "90%";
    this.parentNode.appendChild(list);
    this.addEventListener('keydown',(e) => {
        if(e.keyCode == 40){
            e.preventDefault();
            if(obj.selectedPosition == undefined){
                obj.selectedPosition = 0;
            }else{
                if(document.getElementById(`autocompleter-${this.id}-${obj.selectedPosition + 1}`)){
                obj.selectedPosition = obj.selectedPosition + 1;
                }
            }
            let opt = document.getElementById(`autocompleter-${this.id}-${obj.selectedPosition}`);
            if(opt){
                obj.removeActive();
                opt.classList.add('active');
                obj.selectedItem = opt;
            }
        }
        if(e.keyCode == 38){
            e.preventDefault();
            if(obj.selectedPosition == undefined){
                obj.selectedPosition = 0;
            }else{
                if(document.getElementById(`autocompleter-${this.id}-${obj.selectedPosition - 1}`)){
                obj.selectedPosition = obj.selectedPosition - 1;
                }
            }
            let opt = document.getElementById(`autocompleter-${this.id}-${obj.selectedPosition}`);
            if(opt){
                obj.removeActive();

                opt.classList.add('active');
                obj.selectedItem = opt;
            }
        }
        if(e.keyCode == 13){
            if(obj.selectedPosition == undefined){
                obj.selectedPosition = 0
            }
            e.preventDefault();
            obj.selected(obj.jsonData[obj.selectedPosition]);
            obj.close();

        }
    })


    this.addEventListener('input',(e)=>{

     obj.selectedItem = undefined;
     obj.selectedPosition = undefined;
     list.innerHTML = "";
     fetch(`${obj.url}?${obj.paramName}=${this.value}`).then( res => {
            return res.json();
        }).then(json => {
            obj.jsonData = json;
            if(this.value != ""){
            obj.response_data = [];
            json.forEach((i) => {
               obj.response_data.push(obj.returnType(i));
            })
        
        if(obj.response_data.length > 0){
        obj.response_data.forEach((el,index) => {
            let li = document.createElement('li');
            li.classList.add('list-group-item');
            li.id = "autocompleter-" + this.id + "-" + index;
            li.innerHTML = el;
            list.appendChild(li);
            
        });
        }else{
            let li = document.createElement('li');
            li.classList.add('list-group-item');
            li.classList.add('disabled');
            li.innerHTML = '<small>Não foram encontrados dados</small>';
            list.appendChild(li);

        }
        }
        let opt = list.childNodes;
        if(opt){
           opt.forEach((item,index) => {
                item.addEventListener('click',()=>{
                obj.selected(obj.jsonData[index]);
                obj.close();
            });
               item.addEventListener('mouseover',()=>{
                   obj.removeActive();
                   item.classList.add('active');   
               });

           })
       }
        }).catch(err => {
            console.log(err);
        });
        this.addEventListener('focusout',() =>{
            obj.close();
        })
        
    })
}

/*
Forma de usar:
@array header:
    Um array de objetos chamado header onde header[nome_da_coluna].title = titulo da coluna, e header[nome_da_coluna].type = tipo de para fazer o sort(na verdade
    só é utilizado o tipo date para ordenar por data)
@array data:
    Array de objetos com os itens da página, cada posição do array tem que conter um objeto com: nome_da_coluna(mesmo do header).value = valor.
    opcional: {nome_da_coluna.style} estilo que sera aplicado em cada td
Paginação de objetos(um array de objetos); deve ter tambem um array header com chave => valor para criar o cabeçalho da tabela
Esta pegando cada elemento.value para pegar o valor, pode pegar style para inserir na tabela e class tambem, porem todos tem que vir em casa elemento

Padrão bootstrap
    */
class Paginator{
    constructor(
        listDiv = document.getElementById('pagination-list'),
        pageDiv = document.getElementById('pages-div') 
    ){
            this.listDiv = listDiv;
            this.pageDiv = pageDiv;
            this.done = false;
            this.sortedBy = {'sortBy':null,'sortOrder':null};
    }
    init(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let page;
        urlParams.get('page') ? page = urlParams.get('page') : page = 1;
        urlParams.get('sortBy')  ? this.sortedBy.sortBy = urlParams.get('sortBy') : this.sortedBy.sortBy = null;
        urlParams.get('sortOrder')  ? this.sortedBy.sortOrder = urlParams.get('sortOrder') : this.sortedBy.sortOrder = null;
        this.currentPage = page;
        if(this.sortedBy.sortBy){
            if(this.sortedBy.sortBy in this.headers){
                this.sort(false);
            }
        }
        page < 1 ? page = 1 : page;
        this.paginator(page);
        this.mountPages();
        this.list();
        
    }
    addSpinner(){
        this.spinner = `<div class="d-flex justify-content-center my-5">
        <div class="spinner-border" role="status" style="width: 5rem; height: 5rem; border-width:10px">
          <span class="sr-only">Loading...</span>
        </div>
      </div>`;
      this.pageDiv.style.display = 'none';
      this.listDiv.innerHTML = this.spinner;

    }
    generatePagesArray(paginationRange = 12){
    let currentPage = this.currentPage
    let collectionLength = this.metaData.total;
    let rowsPerPage = this.metaData.per_page;
    var pages = [];
    var totalPages = Math.ceil(collectionLength / rowsPerPage);
    var halfWay = Math.ceil(paginationRange / 2);
    var position;

    if (currentPage <= halfWay) {
        position = 'start';
    } else if (totalPages - halfWay < currentPage) {
        position = 'end';
    } else {
        position = 'middle';
    }

    var ellipsesNeeded = paginationRange < totalPages;
    var i = 1;
    while (i <= totalPages && i <= paginationRange) {
        var pageNumber = this.calculatePageNumber(i, currentPage, paginationRange, totalPages);
        var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
        var closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
        if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
            pages.push('...');
        } else {
            pages.push(pageNumber);
        }
        i ++;
    }
    return pages;
}

calculatePageNumber(i, currentPage, paginationRange, totalPages){
    var halfWay = Math.ceil(paginationRange/2);
    if (i === paginationRange) {
        return totalPages;
    } else if (i === 1) {
        return i;
    } else if (paginationRange < totalPages) {
        if (totalPages - halfWay < currentPage) {
        return totalPages - paginationRange + i;
    } else if (halfWay < currentPage) {
        return currentPage - halfWay + i;
    } else {
        return i;
    }
    } else {
        return i;
    }
}
    removeSpinner(){
        this.listDiv.innerHTML = '';
        this.pageDiv.style.display = '';
    }
    getDataAjax(url = window.location,callback = false ){
        this.addSpinner();
        let headers = new Headers();
        headers.append('X-Requested-With','XMLHttpRequest');
        fetch(url,{
            headers:headers
        }).then(res => {
            return res.json();
        }).then(json =>{
            this.removeSpinner();
            this.setData(json)
            this.done = true;
            if(callback){
                callback(json);
            }
 
        }).catch(err => {
            console.error(err);
        })

    }

    setData(data){
        this.data = data.data;
        this.headers = data.headers;
        this.title = data.title;
        if(data.error){
            this.error = data.title;
            this.message = data.message;
        }else{
            this.message = null;
            this.error = null;
        }
        this.init();
    };
    formatJson(json){
        json = json['data'];
        json = json.replace(/&quot;/g,'"');
        json = json.replace(/&amp;/g,'"');

        json = JSON.parse(json);
        return json;
    }
    setListDiv(div){
        this.listDiv = div;
    }
    setPagesDiv(div){
        this.pageDiv = div;
    }
    paginator(current_page, per_page_items = 25) {
        let items = this.data;
        let offset
        let paginatedItems;
        let page = current_page || 1;
        let per_page = per_page_items || 10;
        let total_pages = Math.ceil(items.length / per_page);
        page > total_pages ? page = total_pages : page;
        offset = (page - 1) * per_page;
        paginatedItems = items.slice(offset).slice(0, per_page_items),

        this.metaData =  {
            page: page,
            per_page: per_page,
            pre_page: page - 1 ? page - 1 : null,
            next_page: (total_pages > page) ? parseInt(page) + 1 : null,
            total: items.length,
            total_pages: total_pages,
            data: paginatedItems
        };
        this.currentPage = page
        this.pages = this.generatePagesArray();
        this.changeUrl('page',this.currentPage);
    }

    changeSortOrder(property)
    {
        this.sortedBy.sortBy = property
        if(!this.sortedBy.sortOrder){
            this.sortedBy.sortOrder = 'DESC'
            return;
        }
            if(this.sortedBy.sortOrder == 'DESC'){
                this.sortedBy.sortOrder = 'ASC';
                return;
            }
            if(this.sortedBy.sortOrder = 'ASC'){
                this.sortedBy.sortOrder = 'DESC'
                return;
            }
    }

    formatDate(date)
    {
        let pieces = date.split('/');
        let seconds = pieces[2].split(':');
        let year = pieces[2].split(" ")[0];
        return new Date(year,pieces[1],pieces[0],seconds[0].split(' ')[1],seconds[1],seconds[2]);
    }

    sort(refresh = true){
        let property = this.sortedBy.sortBy;
        if(this.sortedBy.sortOrder == 'DESC'){

            if(this.headers[property].type == 'date'){
                this.data.sort((a, b) => (this.formatDate(b[property].value) < this.formatDate(a[property].value)) ? 1 : -1)
            }else{
                this.data.sort((a, b) => (a[property].value < b[property].value) ? 1 : -1)
            }
        }else{
            if(this.headers[property].type == 'date'){
                this.data.sort((a, b) => (this.formatDate(b[property].value) > this.formatDate(a[property].value)) ? 1 : -1)
            }else{
                this.data.sort((a, b) => (a[property].value > b[property].value) ? 1 : -1)
            }
        }
        if(refresh){
            this.init();
        }
    }

    list(){
        let items = this.metaData.data;
        let list = this.listDiv;
        list.innerHTML = '';
        if(this.error){
            list.innerHTML = this.message
            this.pageDiv.innerHTML = '';
            return;
        }
        document.getElementById('total-list-span').innerHTML = `<small>Total de ${this.title.plural}: ${this.metaData.total}</small>`
        let res = '';
        let headers = this.headers;
        let headerHtml = '<thead class="thead-dark"><tr>';
        let style = '';
        let cssClass = '';
        let isDeleted;
        let listener;
        let arrow;
        for(const i in headers){
            listener = '';
            arrow = '';
            if(i == this.sortedBy.sortBy){
                if(this.sortedBy.sortOrder == 'DESC'){
                    arrow = ' &#8595;'
                }
                if(this.sortedBy.sortOrder == 'ASC'){
                    arrow = ' &#8593;'

                }
            }
            if(i != 'user_default_actions'){
                listener = `class="hover" data-sort="${i}" id="header-${i}"`
            }
            headerHtml += `<th ${listener}>${headers[i].title}${arrow}</th>`
        }
        headerHtml += '</tr></thead>'
        list.innerHTML += headerHtml;
        for (const item in items) {
            isDeleted = '';
 
            if('extra' in items[item]){
                if(items[item]['extra'].value.deleted){
                    isDeleted = 'deleted'
                }
            }
            
            res += '<tr class="'+isDeleted+'">';
            for (const key in headers) {
                style = '';
                cssClass = '';
                if(items[item][key].hasOwnProperty('style')){
                    style = items[item][key].style;    
                }
                if(items[item][key].hasOwnProperty('class')){
                    cssClass = items[item][key].class
                }

                let title = '';
                if(key != 'user_default_actions'){
                    title = `title="${items[item][key].value}"`;
                }
                res += `<td ${cssClass} ${style} ${title} >${items[item][key].value}</td>`
            }
        res += '</tr>';
        }
        list.innerHTML += res;
        fadeIn(list,'table')
        this.addPagesListener();
    }
    mountPages(){
        let len = this.pages.length;
        let pageDiv = this.pageDiv;
        let active;
        let disabled;
        let pagesResponse = '';
        let prevDisabled;
        let nextDisabled;
        this.metaData.pre_page == null ? prevDisabled = 'disabled' : prevDisabled = 'hover prev-paginate-active';
        this.metaData.next_page == null ? nextDisabled = 'disabled' : nextDisabled = 'hover next-paginate-active';
        let prevBtn = `<li class="page-item ${prevDisabled}">
            <a class="page-link" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
              <span class="sr-only">Previous</span>
            </a>
          </li>`
           let nextBtn = `<li class="page-item ${nextDisabled}">
            <a class="page-link"  aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
              <span class="sr-only">Next</span>
            </a>
          </li>`;

        for(let i = 0; i < len;i++){
            this.currentPage == this.pages[i] ? active = 'active' : active = '';
            typeof this.pages[i] == "number" ? disabled = '' : disabled = 'disabled';
            pagesResponse += `<li class="${disabled} page-item ${active} hover"><a class="page-link next-item-click">${this.pages[i]}</a></li>`;
        }
        pageDiv.innerHTML = prevBtn + pagesResponse + nextBtn;
    }
    changeUrl(param,value){
        var queryParams = new URLSearchParams(window.location.search);
         queryParams.set(param, value);
         history.replaceState(null, null, "?"+queryParams.toString());
    }
    addPagesListener(){
        for(let i in this.headers){
            let head = document.getElementById("header-"+i);
            if(head){
                head.addEventListener('click',(e)=>{
                this.changeSortOrder(head.getAttribute('data-sort'));
                this.changeUrl('sortBy',this.sortedBy.sortBy);
                this.changeUrl('sortOrder',this.sortedBy.sortOrder);
                this.sort();
            })
        }
        }
        let click = document.getElementsByClassName('next-item-click');
        let clickTotal = click.length;
        for(let i = 0; i < clickTotal;i++){
            click[i].addEventListener('click',(e)=>{
                e.preventDefault();
                this.paginator(click[i].innerHTML);
                this.mountPages();
                this.list();
            })
        }
        let nextBtn = document.getElementsByClassName('next-paginate-active')[0];
        let prevBtn = document.getElementsByClassName('prev-paginate-active')[0];
        if(nextBtn){
            nextBtn.childNodes[1].addEventListener('click',(e) => {
                e.preventDefault();
                this.paginator(this.metaData.next_page);
                this.mountPages();
                this.list();            
            })
        }
        if(prevBtn){
            prevBtn.childNodes[1].addEventListener('click',(e) => {
                e.preventDefault();
                this.paginator(this.metaData.pre_page);
                this.mountPages();
                this.list();            
            })
        }
    }
    setFormToAjax(form = document.getElementsByClassName('search-form')[0] ,url = window.location,callback = false){
        form.addEventListener('submit',(e)=>{
            e.preventDefault();
            let data = new FormData(form);
            for (let entry of data) {
                this.changeUrl(entry[0],entry[1]);
        }
        if(callback){
            this.getDataAjax(url,(val) => {
                callback(val);
            });
            return;
        }
        this.getDataAjax(url);
        })
    }
}
