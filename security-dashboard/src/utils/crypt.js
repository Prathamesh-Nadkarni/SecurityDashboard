import * as CryptoJS from 'crypto-js';

var key = await fetch('demo_secret_key.json');
key = await key.json();

const secretKey = key["key"]

export const encrypt = ( plainText ) => {
    const cipherText = CryptoJS.AES.encrypt(plainText, secretKey).toString()
    return cipherText
}

export const decrypt = ( cipherText ) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey )
    const plainText = bytes.toString(CryptoJS.enc.Utf8)
    return plainText
}