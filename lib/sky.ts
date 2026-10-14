/** The window in the hero matches the visitor's own sky (Script S1, "lighting"). */
export const SKY_SCRIPT = `(function(){try{var h=new Date().getHours();var s=h>=5&&h<11?'morning':h<17?'day':h<21?'evening':'night';var q=new URLSearchParams(location.search).get('sky');if(q)s=q;document.documentElement.dataset.sky=s;}catch(e){}})();`;
