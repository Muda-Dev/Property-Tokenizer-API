import request from 'request';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";


export default class Flutterwave {
  constructor() {

  }
 
 
  public async InitiateTransactionRequest(txnRef: string,amount: string,email: string,phone: string,name: string,currency:string) {
   //Emma Keys
   const pvKey = process.env.FL_SECRETE
   const siteURL = process.env.SITE_URL
    var options = {
      'method': 'POST',
      'url': 'https://api.flutterwave.com/v3/payments',
      'headers': {
        'Authorization': 'Bearer ' + pvKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tx_ref": txnRef,
        "amount": amount,
        "currency": currency,
        "redirect_url": siteURL,
        "customer": {
          "email": email,
          "phonenumber": phone,
          "name": name
        },
        "customizations": {
          "title": "UNIFID",
          "description": "Payment for Document verification",
          "logo": "https://qa.stage-mudax.xyz/assets/images/logo.svg"
        }
      })
    
    };
 
    return new Promise((resolve, reject) => {
      request(options, function (error: any, response: any) {
        if (error) {
          reject(error)
        } else {
          var data = response.body;
          console.log("FLW Response", data)
          resolve(data);

        }
      });
    });
  }







}
