import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import * as forge from 'node-forge';

@Injectable({
  providedIn: 'root'
})
export class AesGcmEncryptionService {

  constructor() {
  }

  static getSecretKey() {
    return forge.util.decode64('Xa/Bc14y7+Y0wq2SFHAuovvsfvnW7PUkKncUstn9z7o=');
  }

  static encryptAesGcm(key: any, iv: any, data: any) {
    let cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();

    let encrypted = cipher.output.data;
    let tag = cipher.mode.tag.data;
    let encryptedLoad = encrypted + tag;
    // const encode64 = forge.util.encode64(forge.util.encode64(encryptedLoad) + "::" + iv);
    // return encode64;
    // return forge.util.encode64(encryptedLoad);
    return forge.util.encode64(forge.util.encode64(encryptedLoad) + "::" + iv);
  }

  static decryptAesGcm(key: any, iv: any, data: any) {
    const authTag = data.slice(data.length - 16);
    const encData = data.slice(0, data.length - 16);
    let cipher = forge.cipher.createDecipher("AES-GCM", key);
    cipher.start({ iv: iv, tagLength: 128, tag: authTag });
    cipher.update(forge.util.createBuffer(encData));
    cipher.finish();

    // let decrypted = cipher.output.data;
    return cipher.output.data;
  }

  static getEncPayload(data: any) {
    const sKey = AesGcmEncryptionService.getSecretKey()
    // const trasDate = AesGcmEncryptionService.getIvFromTimestamp();
    const trasDate = new DatePipe("en_IN").transform(new Date(), "dd-MM-yyyy hh:mm:ss");
    // const iv = AesGcmEncryptionService.getBytesFromString(trasDate);
    const iv = forge.util.createBuffer(trasDate).getBytes(16);
    return AesGcmEncryptionService.encryptAesGcm(sKey, iv, JSON.stringify(data));

  }

  static getDecPayload(payload: any) {
    const byteData = forge.util.decode64(payload);
    const sKey = AesGcmEncryptionService.getSecretKey();
    let split = byteData.split("::");
    const iv = forge.util.createBuffer(split[1]).getBytes(16);
    const data = forge.util.createBuffer(split[0]).getBytes();
    const decData = AesGcmEncryptionService.decryptAesGcm(sKey, iv, forge.util.decode64(forge.util.createBuffer(split[0]).getBytes()));
    return forge.util.decodeUtf8(decData);
  }

  // static getBytesFromString(data: any) {
  //   return forge.util.createBuffer(data).getBytes(16);
  // }

  // static getIvFromTimestamp() {
  //   return new DatePipe("en_IN").transform(new Date(), "dd-MM-yyyy hh:mm:ss");
  // }

}
