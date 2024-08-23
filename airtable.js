class AirtableRequestBuilder{
  constructor(base, table){
    this.base = base;
    this.fields = [];
    this.maxRecords = 0;
    this.filterByFormula = [];
    this.table = table;
  }
  addField(field){
    this.fields.push(field);
    return this;
  }
  
  setMaxRecords(maxRecords){
    this.maxRecords = maxRecords;
    return this;
  }
  setView(view){
    this.view = view;
    return this;
  }
  setFilterFormula(filterFormula){
    this.filterByFormula=filterFormula;
    return this;
  }

  param(a) {
    var s = [];
    var add = function (k, v) {
        v = typeof v === 'function' ? v() : v;
        v = v === null ? '' : v === undefined ? '' : v;
        s[s.length] = encodeURIComponent(k) + '=' + encodeURIComponent(v);
    };
    var buildParams = function (prefix, obj) {
        var i, len, key;

        if (prefix) {
            if (Array.isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    buildParams(
                        prefix + '[' + (typeof obj[i] === 'object' && obj[i] ? i : '') + ']',
                        obj[i]
                    );
                }
            } else if (Object.prototype.toString.call(obj) === '[object Object]') {
                for (key in obj) {
                    buildParams(prefix + '[' + key + ']', obj[key]);
                }
            } else {
                add(prefix, obj);
            }
        } else if (Array.isArray(obj)) {
            for (i = 0, len = obj.length; i < len; i++) {
                add(obj[i].name, obj[i].value);
            }
        } else {
            for (key in obj) {
                buildParams(key, obj[key]);
            }
        }
        return s;
    };

    return buildParams('', a).join('&');
  };

  build(){
      var url = "https://api.airtable.com/v0/" + this.base + "/" + this.table + "?";
      var params = {};
      if(this.fields.length > 0) params.fields = this.fields;
      if(this.maxRecords > 0) params.maxRecords = this.maxRecords;
      if(this.view != "") params.view = this.view;
      if(this.filterByFormula != "") params.filterByFormula = this.filterByFormula;
      url = url + this.param(params);
      return url;
  }

}
function testAirtableRequestBuilder(){
  var url = new AirtableRequestBuilder(airtableBase,"Passengers").addField("PassengerName").addField("PassengerNumber").setFilterFormula("FIND('Mary',{PassengerName}) > 0").setMaxRecords(10).build();
  console.log(url);
}
async function airtableFetch(apiKey, url){
  let headers = {
    "Authorization":"Bearer " + apiKey,
    'Content-Type': 'application/json'
  }
  let options = {
    headers:headers,
    method:"GET"
  }
  //console.log(url);
  let response = await fetch(url,options);
  let data = await response.json();
  return data;
}