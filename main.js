
import {createResponse} from 'create-response';
import URLSearchParams from 'url-search-params'
import { httpRequest } from 'http-request';


// edgekv function will return the language json will move to edgekv
function getFromKv(campaign, ln){
  let kv = {
    "camp1": {
      "en": {
        "Banner_lite": "https://campaign-dh.s3.amazonaws.com/100_lite.jpg",
        "Banner_dark": "https://campaign-dh.s3.amazonaws.com/100_dark.jpg",
        "Q": "How many year we can use same phone?",
        "O1": "up to 3yr",
        "O2": "more than 5yr"
      },
      "ml": {
        "Banner_lite": "https://campaign-dh.s3.amazonaws.com/100_lite.jpg",
        "Banner_dark": "https://campaign-dh.s3.amazonaws.com/100_dark.jpg",
        "Q": "ഒരേ ഫോൺ നമുക്ക് എത്ര വർഷം ഉപയോഗിക്കാം?",
        "O1": "3 വർഷം വരെ",
        "O2": "5 വർഷത്തിൽ കൂടുതൽ"
      }
    },
    "camp2": {
      "en": {
        "Banner_lite": "https://campaign-dh.s3.amazonaws.com/102_h_lite.jpg",
        "Banner_dark": "https://campaign-dh.s3.amazonaws.com/102_h_lite.jpg",
        "Q": "Do you think silver is a good investment model ?",
        "O1": "yes",
        "O2": "no"
      },
      "hi": {
        "Banner_lite": "https://campaign-dh.s3.amazonaws.com/102_h_lite.jpg",
        "Banner_dark": "https://campaign-dh.s3.amazonaws.com/102_h_lite.jpg",
        "Q": "क्या आपको लगता है कि चांदी एक अच्छा निवेश मॉडल है?",
        "O1": "हाँ",
        "O2": "नही"
      },
      "ml": {
        "Banner_lite": "https://campaign-dh.s3.amazonaws.com/102_m_lite.jpg",
        "Banner_dark": "https://campaign-dh.s3.amazonaws.com/102_m_lite.jpg",
        "Q": "വെള്ളി നല്ലൊരു നിക്ഷേപ മാതൃകയാണെന്ന് നിങ്ങൾ കരുതുന്നുണ്ടോ?",
        "O1": "അതെ",
        "O2": "അല്ല"
      }
    }
  }

  return kv[campaign][ln]
}

async function constructResponseBody(request) {

    // Defaults to use if item not in EdgeKV
    let ln, content_lang = "en-US", geo_india = false, ad ={}, theme, language, user, name;
    let head, banner, question, option1, option2,responseBody;
    
    // Retrieve Accept-Language header & extract language key
    let languages = request.getHeader('Accept-Language');
    if (languages && languages[0]) {
        content_lang = languages[0].split(',')[0];
        language = content_lang.split('-')[0];
        ln = language.toLowerCase();
    }
    else
     ln = "en";
  
    //Get App setting
    theme = (request.getHeader('App-Setting')) ? request.getHeader('App-Setting'): 'lite';
    let uid = (request.getHeader('uid')) ? request.getHeader('uid'): null;
    
    // async fetch the user details from backend api
    if(uid != null){
      let resp = await httpRequest('https://campaign-edge.dailyhunt.in/uid?id='+uid, {
      method: "GET"
    })
    name = await resp.text();
      
    }
    // Get location
    let country = (request.userLocation.country) ? request.userLocation.country : 'N/A';
    if(country == 'IN')
        geo_india = true;

    // Get query params
    const params = new URLSearchParams(request.query);
    const campaign = params.get('campaign');

    // call edgekv ger json respose
    ad = getFromKv(campaign, ln);
    if(ad == undefined){
     ad = getFromKv(campaign, "en");
    }
    
    //template
    if(geo_india == true)
    {
      //template will move to edge kv
     head = '<head><meta charset="utf-8" /><style>* { margin: 0; padding: 0; border: 0; } body { background-color:#F5F5F5; color: 67727A; font-family: Arial; margin: 0; max-width: 800px; padding: 5px; } .dark{ color: white !important; background: #332f2f !important; } h2 { font-size: 180%; font-weight: 700px; text-align: center; padding-top: 2% } h3 { font-size: 175%; line-height: 155%; padding: 5% 0; } p { font-size: 110%; padding: 1%; text-indent: 2%; text-align: justify; color: #F5F5F5; } img { max-width: 100%; height: auto; width: auto; } h2 { font-size: 150%; } h3 { font-size: 125%; } p { font-size: 110%; } .banner { padding:10px 0;width:100%;height:75% } .one-fourth { float: left; width: 100%;padding:0 0 .7em 0; } .clearBoth { clear:both; } input[type="radio"] { margin-left:10px; }</style><meta name="viewport" content="width=device-width, initial-scale=1"></head><body class="'+theme+'">';
     banner = '<section class="one-fourth" id="html"><img class="banner" src="'+ad["Banner_"+theme]+'"></section><form name=ad-submitForm id="ad-submit" action="/poll" method="get"><div class="clearBoth"></div>';
     question = '<section class="one-fourth" id="css">'+ad["Q"]+'</section>';
     option1 = '<section class="one-fourth" id="css"><input type="radio" name="editList" value="'+ad["O1"]+'" onclick=document.getElementById("ad-submit").submit();>  '+ad["O1"]+'<br></section>';
     option2 = '<section class="one-fourth" id="css"><input type="radio" name="editList" value="'+ad["O2"]+'" onclick=document.getElementById("ad-submit").submit();>  '+ad["O2"]+'<br></section></form></body></html>';
     if(uid != null){
       user = '<section class="one-fourth" id="css">Hi '+name+',</section>';
       responseBody = head+banner+user+question+option1+option2;
     }else
       responseBody = head+banner+question+option1+option2;
    }
    else{
       head = '<head><meta charset="utf-8" /><style>* { margin: 0; padding: 0; border: 0; } body { background-color:#F5F5F5; color: 67727A; font-family: Arial; margin: 0; max-width: 800px; padding: 5px; } .dark{ color: white !important; background: #332f2f !important; } h2 { font-size: 180%; font-weight: 700px; text-align: center; padding-top: 2% } h3 { font-size: 175%; line-height: 155%; padding: 5% 0; } p { font-size: 110%; padding: 1%; text-indent: 2%; text-align: justify; color: #F5F5F5; } img { max-width: 100%; height: auto; width: auto; } h2 { font-size: 150%; } h3 { font-size: 125%; } p { font-size: 110%; } .banner { padding:10px 0;width:100%;height:75% } .one-fourth { float: left; width: 100%;padding:0 0 .7em 0; } .clearBoth { clear:both; } input[type="radio"] { margin-left:10px; }</style><meta name="viewport" content="width=device-width, initial-scale=1"></head><body class="'+theme+'">';
     banner = '<section class="one-fourth" id="html"><img class="banner" src="'+ad["Banner_"+theme]+'"></section></body></html>';
    responseBody = head+banner;
    }

    return responseBody;
  }

export function responseProvider(request) {
    const options = {}
    let body;
    options.method = request.method;
    options.headers = request.getHeaders();
    delete options.headers["pragma"];
    delete options.headers["accept-encoding"];
    delete options.headers["host"];
    let cl = options.headers["Accept-Language"];
    
    return constructResponseBody(request).then((respBoday) => {
      let response = {status: 200, 
        headers: 
          {'Content-Type': 'text/html', 
           'Content-Language': cl,
          },
        body: respBoday
        };
        return new Promise(function(resolve, reject) {
          resolve(createResponse(response.status,response.headers,response.body))
        });
  });
    
    
};
