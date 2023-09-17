# Melobyte
## Decentralising Music Assets using Soroban

Melobyte is a decentralized platform on the Stellar blockchain powered by Soroban that focuses on safeguarding and monetizing music intellectual property. By allowing artists to upload and mint parts of their songs as royalty-bearing tokens, it ensures their creations are protected while offering fans a unique opportunity to invest directly in these musical assets. The integration with Soroban ensures fast, secure, and transparent transactions, providing an efficient solution to the challenges traditionally faced by music creators in an evolving digital landscape.

<img width="1440" alt="Screenshot 2023-09-17 at 15 58 40" src="https://github.com/jjjutla/Melobyte/assets/22000925/fec1f663-78f3-4093-82a2-bcca0af8aa54">

## Project Goal

Melobyte was inspired by the story of drummer Gregory Coleman, whose famous 4-bar solo was widely sampled but never paid for, leading him to die homeless. Today, many artists face issues like underpayment from streaming platforms, intellectual theft, incorrect song credits, and unclear royalties. Some unique details in songs, such as a single beat, are left unprotected. Fans also desire a deeper connection to their music.

Melobyte aims to solve these problems by using blockchain technology. This ensures artists have clear proof of their work, standardizes song information, and introduces a token system, allowing fans and artists to interact while ensuring fair compensation.

https://arxiv.org/abs/1911.08278

# Workflow

Once the creator selects to mint their track a freighter popup appears asking the user to approve the transaction, which will invoke the host function to mint and ask to transfer 256 XLM from their account. Once the transaction has been approved and signed using freighter wallet the artist is redirected to the creator uploader page. Here they input the metadata of the track, upload the full track and the album cover. They will also have the option to encrypt the upload to IPFS.

The track waveform will then be loaded and the creator annotes the track to identify sections such as Intro, Verse, Chorus etc so spesific parts of the composition can be identified within the dataset. They can also view the audio fingerprint. The artist then uploads the multi-channel audio files of their song as a proof of creation to instantiate the creation medatata to a base layer that refers to the encrypted upload of the multip channel audio files on IPFS. The self referencing binary tree is split into the stems so at the atomic level a single beat, syllable, note ot bass is a piece of intellectual property worth of protection.

Once the metadata is instantiated to the base later and the multichanne audio files are uploaded to IPFS fans and other artists can access these assets in the marketplace. An ERC721 marketplace contract is deployed to  performs trust-less validation and execution of NFT trades and these tokens can be sold.



## - [Rust] Smart Contracts:
- An implementation of [ERC721](https://docs.openzeppelin.com/contracts/2.x/api/token/erc721) token demonstrating how to convert and ethereum standard to Soroban. 
- A [contract](https://github.com/jjjutla/Melobyte/blob/main/erc721/src/lib.rs) that uses the converted ERC721 implementation.
- A [marketplace](https://github.com/jjjutla/Melobyte/blob/main/mlh-marketplace/src/lib.rs) contract that performs trust-less validation and execution of NFT trades.

## - [Bash] Deployment and Initialization Scripts:
- A collection of Bash [scripts](https://github.com/jjjutla/Melobyte/tree/main/melobyte-contract) that fascilitate the deployment and initialization of the smart contract and deployments if the local standalone network

## - [Astro] Font end implementation:
- Developed using Astro, mainly as it was a new learning experiance working with this framework and is more flexible, which allowed me to build UI with any popular component library.
- Exposes the smart contract functions letting you mint, buy and transfer the tokens.

## - Security
- A [storage crate](https://github.com/jjjutla/Melobyte/blob/main/storage/src/lib.rs) that allows more convenient api for the soroban storage access
- Secure storage using [Web3Storage](https://github.com/jjjutla/Melobyte/blob/0497f4a307156ec94b91a2f8afb9f894df4b9a81/melobyte-creator/App.tsx#L376) and the CryptoJS library to encrypt files

## - [Typescript]: Components and Hooks
- These are the functions and components that make the functionality of the UI work:
  	-  A [recursive binary tree](https://github.com/jjjutla/Melobyte/blob/c6901bd17ca1d7e9d8fdb75dd0e66016e2352d79/melobyte-creator/utils/binaryTreeGenerator.ts) that is used to organise the stems into their individual beats to protect the most atomic part of the song.
  	-  [Wavesurfer.js](https://github.com/jjjutla/Melobyte/blob/c6901bd17ca1d7e9d8fdb75dd0e66016e2352d79/melobyte-creator/components/WaveForm/index.jsx): Used to display the waveform and the uique trackfingerprintID
 ## - Payments
 - Soroban ....
 - token royalities

# Demo

The video demo is: 


## To launch on standalone 

### 1. Build the contracts

### 2. Run the standalone.sh script

### 3. Deploy the Contract:

```
soroban config network add standalone \
    --rpc-url http://localhost:8000/soroban/rpc \
    --network-passphrase "Standalone Network ; February 2017"
```
### 4. Create and fund an admin account:

```
soroban config identity generate admin
curl "http://localhost:8000/friendbot?addr=$(soroban config identity address admin)"
```
### 5. Deploy the init contract:

```
soroban contract deploy --wasm ./target/melobyte-init.wasm \
    --source admin 
    --network standalone
```
### 6. Invoke the initialize function with the contractID:

```
soroban contract invoke --id [CONTRACT_ID] --source admin \
    --network standalone \
    -- initialize \
	--admin admin \
	--asset $(soroban lab token id --asset native --network standalone) \
	--price 2560000000
 ```

### 7. Install the contract

### 8. Upgrade the contract with the WASM hash

### 9. Generate contract bindings

```
soroban contract bindings typescript \
    --wasm ./target/melobyte-prod.wasm \
	--network standalone \
	--contract-id [CONTRACT_ID] \
	--contract-name Melobyte \
	--output-dir node_modules/Melobyte
```
### 10. Export Web3Storage token and run:

```
export REACT_APP_WEB3_STORAGE=[TOKEN]
```


# Images
## Invoking the function and approving the mint transaction:
<img width="1440" alt="Screenshot 2023-09-17 at 15 51 48" src="https://github.com/jjjutla/Melobyte/assets/22000925/4254393d-f8ce-4186-8f65-ee5f18b319ad">

## The NFT marketplace displaying the song assets for sale:
<img width="1440" alt="Screenshot 2023-09-17 at 15 58 32" src="https://github.com/jjjutla/Melobyte/assets/22000925/552cebc0-710a-4242-b0b0-706044a1e25a">

## The creator upload page where the metadata gets uploaded:
<img width="1440" alt="Screenshot 2023-09-17 at 15 59 54" src="https://github.com/jjjutla/Melobyte/assets/22000925/53beb298-4b64-4396-9bcb-eb2c862a1643">

## The track waveform and the unique fingerpint ID:
<img width="1440" alt="Screenshot 2023-09-17 at 16 00 12" src="https://github.com/jjjutla/Melobyte/assets/22000925/64b938e6-1e2f-44d2-94f1-ad64d70d13a4">

## The track eaveform with the first 15 seconds selected as the introduction to be minted:
<img width="1440" alt="Screenshot 2023-09-17 at 16 00 35" src="https://github.com/jjjutla/Melobyte/assets/22000925/789a9ee5-5f1e-4ec9-a136-7ba75b54ec40">

## Uploading the stem files, which act as the proof of creation:
<img width="1440" alt="Screenshot 2023-09-17 at 16 00 45" src="https://github.com/jjjutla/Melobyte/assets/22000925/da8a4a46-e648-431f-899a-47ee7db050e4">

## Whats next for Melobyte?
The journey of Melobyte is just starting. My primary focus would be to improve the UI and continue testing and auditing the contracts. Then the platform will be suitable to deploy live and onboard artists and fans. New token standard?

## Limitations
Being a solo fullstack developer with a limited timeframe to complete this project there were several limitations and restrictions I had to put on the scope of this project. The most noticeable probelem was the latest version of freighter caused trouble with reading the XDR. Furthermore...



# MIT license 
MIT License
Copyright (c) 2023 Jeevan Jutla

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so.

See the LICENSE file for details.
