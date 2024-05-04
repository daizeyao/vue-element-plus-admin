#include <openssl/aes.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/sha.h>

#include <cstring>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>

using namespace std;

string sha256(const string str) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    EVP_MD_CTX *mdctx;
    const EVP_MD *md = EVP_sha256();

    mdctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(mdctx, md, NULL);
    EVP_DigestUpdate(mdctx, str.c_str(), str.size());
    EVP_DigestFinal_ex(mdctx, hash, NULL);
    EVP_MD_CTX_free(mdctx);

    stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << hex << setw(2) << setfill('0') << (int)hash[i];
    }
    return ss.str();
}

string generateRandomFilename(int length) {
    srand(time(0));
    static const string charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    string result;
    result.reserve(length);
    for (int i = 0; i < length; ++i) {
        result.push_back(charset[rand() % charset.length()]);
    }
    result += ".dzy";
    return result;
}

void encryptFile(const string &directory, const string &filename,
                 const string &key) {
    string tempFilename = filename + ".tmp";
    ifstream inFile(directory + filename, ios::binary);
    if (!inFile) {
        cerr << "Error opening input file\n";
        return;
    }
    ofstream outFile(directory + tempFilename, ios::binary);
    if (!outFile) {
        cerr << "Error opening output file\n";
        return;
    }

    // 使用PBKDF2进行密钥扩展
    unsigned char derivedKey[32];
    if (!PKCS5_PBKDF2_HMAC(key.c_str(), key.size(), NULL, 0, 1000, EVP_sha256(),
                           sizeof(derivedKey), derivedKey)) {
        cerr << "Error deriving key\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    // 写入加密头信息
    // 写入密文标签
    string labelCheck = sha256("HZNUdzy").substr(0, 16);
    outFile.write(labelCheck.c_str(), 16);

    // 计算加密前文件名长度
    string originalFilename = filename.substr(filename.find_last_of('/') + 1);
    short filenameLength = originalFilename.length();

    // 计算密文头长度
    short headerLength = 70 + filenameLength;

    // 写入密文头长度
    outFile.write(reinterpret_cast<const char *>(&headerLength), sizeof(short));

    // 写入口令哈希值
    string keyHash = sha256(key);
    outFile.write(keyHash.c_str(), 32);

    // 写入加密算法、密钥长度、加密模式、加密初始向量
    char encryptionAlgorithm = 1;  // AES256
    outFile.write(&encryptionAlgorithm, 1);
    short keyLength = 256;  // 256-bit key
    outFile.write(reinterpret_cast<const char *>(&keyLength), sizeof(short));
    char encryptionMode = 1;  // CBC mode
    outFile.write(&encryptionMode, 1);
    char iv[16];  // 初始化向量
    RAND_bytes(reinterpret_cast<unsigned char *>(&iv), 16);
    outFile.write(iv, 16);

    // 写入加密前文件名
    outFile.write(originalFilename.c_str(), filenameLength);

    // 初始化加密上下文
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        cerr << "Error creating cipher context\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    // 设置加密算法、密钥和初始向量
    if (1 != EVP_EncryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, derivedKey,
                                (unsigned char *)iv)) {
        cerr << "Error initializing encryption\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    // 加密文件内容
    char c;
    int len;
    unsigned char outbuf[1024];
    while (inFile.get(c)) {
        if (1 != EVP_EncryptUpdate(ctx, outbuf, &len, (unsigned char *)&c, 1)) {
            cerr << "Error encrypting data\n";
            remove((directory + tempFilename).c_str());
            return;
        }
        outFile.write((char *)outbuf, len);
    }

    // 结束加密
    if (1 != EVP_EncryptFinal_ex(ctx, outbuf, &len)) {
        cerr << "Error finalizing encryption\n";
        remove((directory + tempFilename).c_str());
        return;
    }
    outFile.write((char *)outbuf, len);

    // 清理
    EVP_CIPHER_CTX_free(ctx);
    inFile.close();
    outFile.close();

    if (remove((directory + filename).c_str()) != 0) {
        cerr << "Error deleting original file\n";
        return;
    }
    string newFilename = generateRandomFilename(10);
    // 重命名临时文件
    if (rename((directory + tempFilename).c_str(),
               (directory + newFilename).c_str()) != 0) {
        cerr << "Error renaming file\n";
        return;
    }
    cout << newFilename << '\n';

    // cout << "Encryption successful.\n";
}

void decryptFile(const string &directory, const string &filename,
                 const string &key) {
    string tempFilename = filename + ".tmp";

    ifstream inFile(directory + filename, ios::binary);
    ofstream outFile(directory + tempFilename, ios::binary);
    if (!inFile) {
        cerr << "Error opening input file\n";
        return;
    }
    // 使用PBKDF2进行密钥扩展
    unsigned char derivedKey[32];
    if (!PKCS5_PBKDF2_HMAC(key.c_str(), key.size(), NULL, 0, 1000, EVP_sha256(),
                           sizeof(derivedKey), derivedKey)) {
        cerr << "Error deriving key\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    // 读取密文标签
    char labelHash[16];
    inFile.read(labelHash, 16);
    string labelStr(labelHash, 16);
    string labelCheck = sha256("HZNUdzy").substr(0, 16);

    // 检查密文标签
    if (labelStr != labelCheck) {
        cerr << "Error: Not encrypted by this software\n";
        return;
    }

    // 读取密文头长度
    short headerLength;
    inFile.read((char *)&headerLength, 2);

    // 读取加密口令哈希值
    char keyHash[32];
    inFile.read(keyHash, 32);
    string storedKeyHash(keyHash, 32);
    string keyHashInput = sha256(key);

    // 读取加密算法、密钥长度、加密模式、加密初始向量
    char encryptionAlgorithm;
    short keyLength;
    char encryptionMode;
    char iv[16];
    inFile.read(&encryptionAlgorithm, 1);
    inFile.read((char *)&keyLength, 2);
    inFile.read(&encryptionMode, 1);
    inFile.read(iv, 16);

    // 读取加密前文件名
    char *originalFilenameBuffer = new char[headerLength - 70];
    inFile.read(originalFilenameBuffer, headerLength - 70);
    originalFilenameBuffer[headerLength - 70] = '\0';
    string originalFilename(originalFilenameBuffer, headerLength - 70);
    delete[] originalFilenameBuffer;

    // 密码核对
    if (storedKeyHash != keyHashInput.substr(0, 32)) {
        cerr << "Error: incorrect password\n";
        return;
    }

    // 初始化解密上下文
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        cerr << "Error creating cipher context\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    // 设置解密算法、密钥和初始向量
    if (1 != EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, derivedKey,
                                (unsigned char *)iv)) {
        cerr << "Error initializing decryption\n";
        remove((directory + tempFilename).c_str());
        return;
    }

    if (!outFile) {
        cerr << "Error opening output file\n";
        return;
    }

    char c;
    int len;
    unsigned char outbuf[1024];
    while (inFile.get(c)) {
        // 解密密文
        if (1 != EVP_DecryptUpdate(ctx, outbuf, &len, (unsigned char *)&c, 1)) {
            cerr << "Error decrypting data\n";
            remove((directory + tempFilename).c_str());
            return;
        }
        outFile.write((char *)outbuf, len);
    }

    // 结束解密
    if (1 != EVP_DecryptFinal_ex(ctx, outbuf, &len)) {
        cerr << "Error finalizing decryption\n";
        remove((directory + tempFilename).c_str());
        return;
    }
    outFile.write((char *)outbuf, len);

    // 清理
    EVP_CIPHER_CTX_free(ctx);
    inFile.close();
    outFile.close();

    if (remove((directory + filename).c_str()) != 0) {
        cerr << "Error deleting original file\n";
        return;
    }

    // 重命名临时文件
    if (rename((directory + tempFilename).c_str(),
               (directory + originalFilename).c_str()) != 0) {
        cerr << "Error renaming file\n";
        return;
    }
    cout << originalFilename << '\n';
    // cout << tempFilename << " " << filename << '\n';

    // cout << "Decryption successful.\n";
}

int main(int argc, char *argv[]) {
    if (argc != 4) {
        cerr << "Usage: " << argv[0] << " <mode> <key> <filename>\n";
        return 1;
    }

    int mode = atoi(argv[1]);
    if (mode != 0 && mode != 1) {
        cerr << "Invalid mode\n";
        return 1;
    }

    string key = argv[2];
    string path = argv[3];
    string filename = path.substr(path.find_last_of("\\/") + 1);
    string directory = path.substr(0, path.find_last_of("\\/")) + "/";

    if (mode == 1) {
        encryptFile(directory, filename, key);
    } else {
        decryptFile(directory, filename, key);
    }

    return 0;
}

// int main(int argc, char *argv[]) {
//     if (argc != 2) {
//         cerr << "Usage: " << argv[0] << " <filename>\n";
//         return 1;
//     }

//     int mode;
//     cout << "Enter 0 for decryption, 1 for encryption: ";
//     cin >> mode;
//     if (mode != 0 && mode != 1) {
//         cerr << "Invalid mode.\n ";
//         return 1;
//     }

//     string key;
//     cout << "Please enter the password: ";
//     cin >> key;
//     string filename = argv[1];
//     filename = filename.substr(filename.find_last_of("\\/") + 1);

//     if (mode == 1) {
//         encryptFile(filename, key);
//     } else {
//         decryptFile(filename, key);
//     }
//     getchar();
//     getchar();
//     return 0;
// }
