let taxSwitch = document.getElementById("flexSwitchCheckDefault");
taxSwitch.addEventListener("click", ()=>{
    let taxInfo = document.getElementsByClassName("tax-info");
    for (info of taxInfo){
        if(info.style.display != "inline"){
            info.style.display = "inline";
        }else{
            info.style.display = "none";
        }
    }
});

const filters = document.querySelectorAll(".filter"); 
// console.log(filters);
filters.forEach(filter => {
    filter.addEventListener("click", function () {
        if(this.style.opacity != 1){
            this.style.opacity = 1;
        }else{
            this.style.opacity = 0.5;
        }
    });
});






