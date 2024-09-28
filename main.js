const request = require("request");
const fs = require("fs-extra");
const path = require("path");
const crypto = require('crypto');

// Extracted common variables
const ROOT_DIR = path.resolve(__dirname);
const GIT_CONFIG_PATH = path.join(ROOT_DIR, ".git", "config");
const README_DIR = path.join(ROOT_DIR, "README");
const DOCS_README_PATH = path.join(ROOT_DIR, "docs", "README.md");
const README_PATH = path.join(ROOT_DIR, "README.md");
const DEFAULT_IMAGE_EXT = 'jpg';


// The rest of the code remains the same
async function readline_sync() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    })
    return new Promise((resolve, reject) => {
        readline.question(``, data => {
            readline.close();
            resolve(data)
        })
    });
}

async function get_github_username_repositories_name() {
    // 查看.git文件夹是否存在
    let exist = fs.existsSync(GIT_CONFIG_PATH);
    // 如果.git存在则读取username和repositories_name
    let username = "";
    let repositories_name = "";
    let url = "";
    if (exist) {
        let config_content = String(fs.readFileSync(GIT_CONFIG_PATH))
        let re_n_t = /\n|\t/;
        let config_content_list = config_content.split(re_n_t)
        for (let i = 0, config_content_list_length = config_content_list.length; i < config_content_list_length; i++) {
            if (config_content_list[i].indexOf("url") === 0) {
                url = config_content_list[i].split("url = ")[1];
                url = url.split(".git")[0]
                let url_info = url.split("/");
                url_info.reverse();
                username = url_info[1];
                repositories_name = url_info[0];
            }
        }
    }
    // 如果.git不存在则要求输入username和repositories_name
    if (exist === false) {
        console.log("请输入github用户名：");
        username = await readline_sync();

        console.log("请输入仓库名：");
        repositories_name = await readline_sync();
    }

    console.log(username, repositories_name);
    return new Promise((resolve, reject) => {
        resolve({ username: username, repositories_name: repositories_name })
    })
}

function get_img_url_list_in_md(md_path) {
    const md_content = String(fs.readFileSync(md_path));
    re_md_img = /\!\[(.*)\]\((.*)\)/g;
    let md_img_list = md_content.match(re_md_img);

    console.log(md_img_list);

    let img_url_list = [];

    for (let i = 0, md_img_list_length = md_img_list.length; i < md_img_list_length; i++) {
        img_url = md_img_list[i].match(/(.*)\((.*)\)/)[2];
        img_url_list.push(img_url);
    }
    return img_url_list;
}

function download_img_to_readme_dir(img_url, pre_image_url) {
    return new Promise((resolve, reject) => {
        const imgUrlInfo = path.parse(img_url);
        const ext = imgUrlInfo.ext.slice(1) || DEFAULT_IMAGE_EXT;

        // 使用URL的MD5哈希值作为文件名的一部分
        const urlHash = crypto.createHash('md5').update(img_url).digest('hex');
        const newImgName = `${urlHash}.${ext}`;
        const newImgPath = path.join(README_DIR, newImgName);

        // 检查新文件名是否已存在
        fs.access(newImgPath, fs.constants.F_OK, (err) => {
            if (!err) {
                console.log(`File ${newImgName} already exists, skipping download.`);
                resolve(`${pre_image_url}${newImgName}`);
                return;
            }

            // 文件不存在，继续处理
            if (img_url.startsWith('http')) {
                // 下载网络图片
                request(img_url)
                    .on('error', (error) => {
                        console.error('Error downloading image:', error);
                        resolve(img_url);  // 出错时返回原始URL
                    })
                    .pipe(fs.createWriteStream(newImgPath))
                    .on('close', () => {
                        resolve(`${pre_image_url}${newImgName}`);
                    });
            } else {
                // 复制本地图片
                fs.createReadStream(img_url)
                    .pipe(fs.createWriteStream(newImgPath))
                    .on('error', (error) => {
                        console.error('Error copying image:', error);
                        resolve(img_url);  // 出错时返回原始URL
                    })
                    .on('close', () => {
                        resolve(`${pre_image_url}${newImgName}`);
                    });
            }
        });
    });
}

function replace_readme_info (readme_content, src_text, dest_text) {
    // 获取README.md原始信息
    // let readme_content = String(fs.readFileSync(path.join("./", "docs", "README.md")));
    tmp_readme_content = readme_content.replace(src_text, dest_text);
    return tmp_readme_content
}

async function main() {
    console.log('process.cwd():' + process.cwd());

    // 获取仓库的用户名和仓库名
    let { username, repositories_name } = await get_github_username_repositories_name();

    console.log(username, repositories_name);

    // 拼接README图片前缀
    let pre_image_url = "https://raw.githubusercontent.com/" + username + "/" + repositories_name + "/master/README/"

    // 获取README.md里面的所有图片地址列表
    let img_url_list = get_img_url_list_in_md(DOCS_README_PATH);

    // 如果README文件夹不存在，则创建README文件夹
    if ((fs.existsSync(README_DIR)) === false) {
        fs.mkdirSync(README_DIR)
    }
    let readme_content = String(fs.readFileSync(DOCS_README_PATH));
    for (let i = 0, img_url_list_length = img_url_list.length; i < img_url_list_length; i++) {
        // 如果图片以pre_image_url开头，则跳过
        if (img_url_list[i].indexOf(pre_image_url) === -1) {
            // 将图片下载到README文件夹，并生成图片github地址
            let new_img_url = await download_img_to_readme_dir(img_url_list[i], pre_image_url);
            // 替换README.md内图片地址为github地址
            readme_content = replace_readme_info(readme_content, img_url_list[i], new_img_url);
            console.log("将==》",img_url_list[i] ,"替换为==》",new_img_url);
        }
    }

    fs.writeFileSync(README_PATH, readme_content);
}

main();