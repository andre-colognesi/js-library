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

//Paginação de objetos(um array de objetos); deve ter tambem um array header com chave => valor para criar o cabeçalho da tabela

class Paginator{
    constructor(
        listDiv = document.getElementById('pagination-list'),
        pageDiv = document.getElementById('pages-div') 
    ){
            this.listDiv = listDiv;
            this.pageDiv = pageDiv;
            this.done = false;
            this.addSpinner();
            listDiv.innerHTML = this.spinner;
    }
    init(){
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let page = 1;
        if(urlParams.get('page')){
            page = urlParams.get('page');
        }
        this.currentPage = page;
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
    }
    getDataAjax(url = window.location,callback = false ){
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
        if(data.error){
            this.error = data.title;
            this.message = data.message;
        }
        this.init();
    };
    formatJson(json){
        json = json['data'];
        json = json.replace(/&quot;/g,'"');
        json = json.replace(/&amp;/g,'"');
        console.log(json)

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
        this.currentPage = current_page;
        let items = this.data;
        let page = current_page || 1,
        per_page = per_page_items || 10,
        offset = (page - 1) * per_page,
    
        paginatedItems = items.slice(offset).slice(0, per_page_items),
        total_pages = Math.ceil(items.length / per_page);
        this.metaData =  {
            page: page,
            per_page: per_page,
            pre_page: page - 1 ? page - 1 : null,
            next_page: (total_pages > page) ? parseInt(page) + 1 : null,
            total: items.length,
            total_pages: total_pages,
            data: paginatedItems
        };
        this.pages = this.generatePagesArray();
        this.changeUrl();
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
        let res = '';
        let headers = this.headers;
        let headerHtml = '<thead class="thead-dark"><tr>';
        for(const i in headers){
            headerHtml += `<th>${headers[i]}</th>`
        }
        headerHtml += '</tr></thead>'
        list.innerHTML += headerHtml;
        for (const item in items) {
            let isDeleted = '';
            if('extra' in items[item]){
                if(items[item]['extra'].deleted){
                    isDeleted = 'deleted'
                }
            }
            res += '<tr class="'+isDeleted+'">';
            for (const key in headers) {
                res += `<td>${items[item][key]}</td>`
            }
        res += '</tr>';
        }
        list.innerHTML += res;
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
    changeUrl(){
        var queryParams = new URLSearchParams(window.location.search);
         queryParams.set("page", this.currentPage);
         history.replaceState(null, null, "?"+queryParams.toString());
    }
    addPagesListener(){
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
}
