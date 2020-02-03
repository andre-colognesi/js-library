HTMLElement.prototype.autocompleter = function(obj = {
    url: false, 
    type: function(){},
    selected: function(obj){},
    }){
    console.log(obj);

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
    this.addEventListener('focusout',() =>{
        obj.close();
    })
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
               obj.response_data.push(obj.type(i));
            })
        obj.response_data.forEach((el,index) => {
            let li = document.createElement('li');
            li.classList.add('list-group-item');
            li.id = "autocompleter-" + this.id + "-" + index;
            li.innerHTML = el;
            list.appendChild(li);
            
        });
        }
        let opt = list.childNodes;
        if(opt){
           opt.forEach((i,index) => {
               i.addEventListener('mouseover',()=>{
                   obj.removeActive();
                   i.classList.add('active');   
               })
               i.addEventListener('click',()=>{
                   obj.selected(obj.jsonData[index]);
                   obj.close();
               })
           })
       }
        }).catch(err => {
            console.log(err);
        })
    })
}