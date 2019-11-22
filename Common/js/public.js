$(function(){
    function getSize(){
        var oHtml=document.documentElement;
        var viewWidth=oHtml.clientWidth;
        if(viewWidth<=320){
            oHtml.style.fontSize='20px';
        }else if(viewWidth>=750){
            oHtml.style.fontSize='50px';
        }else{
            oHtml.style.fontSize=viewWidth/15+'px';
        }
    }
    getSize();
    window.onresize=function(){
        getSize();
    }
});