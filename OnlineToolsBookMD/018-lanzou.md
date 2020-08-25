---
title: 018《蓝奏云》蓝奏云存放2G大文件解决方案
---

在线直达地址：[https://lanzou.com/](https://lanzou.com/)

zhaoolee前两天分享了2GＢ的Ｐixiv插画资源，很正常的资源，但是被百度网盘封禁了，zhaoolee苦百度网盘久矣，于是zhaoolee下定决心换一个网盘，选来选去还是蓝奏云最好用，但是蓝奏云本身不支持100MB以上的文件上传，于是zhaoolee想了一个法子...


蓝奏云是一款网页网盘服务, 特色是免费稳定,无限空间, 永久存储, 上传下载不限速, 无需下载客户端(根本没有客户端)

但蓝奏云免费用户有两个限制 

限制一: 上传的文件大小不超过100M 
限制二: 上传的文件后缀名只能是`doc,docx,zip,rar,apk,ipa,txt,exe,7z,e,z,ct,ke,cetrainer,db,tar,pdf,w3x
epub,mobi,azw,azw3,osk,osz,xpa,cpk,lua,jar,dmg,ppt,pptx,xls,xlsx,mp3
ipa,iso,img,gho,ttf,ttc,txf,dwg,bat,imazingapp,dll,crx,xapk,conf
deb,rp,rpm,rplib,mobileconfig,appimage,lolgezi,flac`

## 如何存放2G的大文件?

存放2G大文件需要分两步完成, **文件分卷压缩** 和 **文件重命名**

**文件分卷压缩** 可以将文件切分为~~90M~~**50M**的小文件(有些压缩软件分卷有误差,如果写100M,最终的文件可能超过100M)

**文件重命名** 为什么要重命名? 因为文件被分卷压缩后, 后缀名成了`.001`, `.002` ... , 而蓝奏云不允许`.001`, `.002`之类后缀的文件上传, 解决方法也很简单, 用免费重命名BulkRenameUtility工具, 给分卷文件批量添加
`.zip`后缀,然后上传到蓝奏云, 下载后, 用免费重命名工具批量移除`.zip`后缀就好了



## 文件分卷压缩

绝大多数压缩解压软件都支持分卷压缩, 这里选用免费开源的7-Zip做演示(7-Zip软件安装包文末可提取)

![](https://www.v2fy.com/asset/017-lanzou/fenjuanyasuo.gif)


---
## BulkRenameUtility简易教程

####  为分卷压缩的压缩包添加`.zip`

![](https://www.v2fy.com/asset/017-lanzou/2_zip.gif)


![](https://www.v2fy.com/asset/017-lanzou/add-dot-zip.png)

####  将`.zip`的后缀移除

![](https://www.v2fy.com/asset/017-lanzou/2_zip_299.gif)


![](https://www.v2fy.com/asset/017-lanzou/rm-zip.png)


(BulkRenameUtility软件安装包文末可提取)

---


## 将`.zip`压缩包,上传到蓝奏云

![](https://www.v2fy.com/asset/017-lanzou/2_lanzou_2.gif)

## 遇到一个有点意思的坑

这里zhaoolee遇到一个坑， zhaoolee开始设定分卷压缩为90M，会有五分之一的几率上传失败，为什么是五分之一，因为蓝奏云虽然每次可以上传20个文件，但20个文件的总大小不能超过500M, zhaoolee开始分的是90M的分卷，每次最多可以传5个，但总有一个会**上传失败**

zhaoolee开始以为是文件名包含有`男性`这种敏感词，所以会失败， 但把名字换成了`p`，但依然失败

zhaoolee开始尝试减小分卷压缩单个卷的尺寸，当单卷大小下降到50M时(由于单次上传小于500M的限制，每次可上传９个)，文件就没有了上传失败的情况

![](https://www.v2fy.com/asset/017-lanzou/43.png)

结论： **建议单卷压缩不超过50M**


## 解压下载后，分卷压缩的文件

![](https://www.v2fy.com/asset/017-lanzou/huifu.gif)



## 本在线工具直达链接:

[https://lanzou.com/](https://lanzou.com/)


本文所用Ｐixiv资源下载地址：https://www.lanzous.com/b00nf489a


BulkRenameUtility 下载地址：　https://www.lanzous.com/b00nf4muf

７-Zip下载地址：https://www.lanzous.com/b00nf4lhg



## 小结:

蓝奏云相比百度网盘真的是算是良心产品, 通过以上方法, 可以破除100M的限制,愉快的上传各种大容量文件了