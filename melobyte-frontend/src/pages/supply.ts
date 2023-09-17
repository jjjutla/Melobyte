import * as melobyte from 'melobyte';

export async function get({params, request}) {

  const FakeWallet = {
    isConnected: function()  { return false },
  }
  console.log("Calling total_supply");
  let total = await melobyte.totalSupply({wallet: FakeWallet});
  let uris = []
  for (let i=0; i < total; i++) {
    let data = await melobyte.tokenUri({token_id: i}, {wallet: FakeWallet});
    uris.push(data);
  }
  console.log(total);
  return {
    body: JSON.stringify({
      supply: total,
      uris: uris,
    }),
  };
}
