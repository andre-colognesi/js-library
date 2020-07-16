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
