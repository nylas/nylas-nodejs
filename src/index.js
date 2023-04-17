const Nylas = require('../lib/nylas')

const nylas = new Nylas({clientId: "47e9b294-afe7-4041-9a77-c6236187fef8", clientSecret:"9LqYvPpoj8LYOtm9"})

function main(){
  const tok = nylas.auth.validateAccessToken("eGK5GauMI7l0SWy7lAi4TRGgiMg0oXWADQS-i1U2JfHzVdPZQTdAtxnpp4P_mn9-SDcuYEbiLqm3tiGfjkTFCyCQ8Kf1bDQXv5TtaIlk-hapCj93QZFwPFotSpLyirvCwzHlEO7isYUW72UEQqQOx8XAgl5vokXBuQP0mGlgzKk")
  console.log(tok)
  tok.then(r => {
    console.log(r)

  })
}
main()