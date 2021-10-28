const excelJS = require('exceljs');
const kmeans = require('node-kmeans');
let Timeout = null;
let data = [];
let hasil = null;
let waktu = {
    mulai : 0, selesaiMembacaData : 0, selesaiKonversiData : 0, selesaiClusteringData : 0, selesaiMenulisData : 0
}

function detik(time){
    return time / 1000;
}

function jikaSelesai(timeout, callback){
    clearTimeout(Timeout);
    Timeout = setTimeout(function(){
        callback();
    }, timeout)
}

async function setelahProsesCluster(){
    waktu.selesaiClusteringData = new Date().getTime();
    const book = new excelJS.Workbook();
    for(let i in hasil){
        const sheet = book.addWorksheet(`Cluster ${(i+1)}`);
        sheet.addRow(['Gender', 'Age', 'Annual Income (k$)', 'Spending Score(1-100)'])
        for(let j in hasil[i].clusterInd){
            sheet.addRow(data[hasil[i].clusterInd[j]])
            sheet.getRow(Number(j)+2).eachCell((cell, cellNumber) => {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: {style:'thin', color: {argb:'00000000'}},
                    left: {style:'thin', color:{argb:'00000000'}},
                    bottom: {style:'thin', color: {argb:'00000000'}},
                    right: {style:'thin', color:{argb:'00000000'}},
                };
            })
        }
        const col = sheet.getColumn(1);
        const row = sheet.getRow(1);
        col.width = 20;
        row.height = 30;
        row.eachCell(function(cell, cellNumber){
            cell.alignment = {vertical:'middle', horizontal:'center'};
            cell.border = {
                top: {style:'thin', color: {argb:'00000000'}},
                left: {style:'thin', color: {argb:'00000000'}},
                bottom: {style:'thin', color: {argb:'00000000'}},
                right: {style:'thin', color: {argb:'00000000'}}
            };
        })
    }
    await book.xlsx.writeFile('HasilClustering.xlsx');
    waktu.selesaiMenulisData = new Date().getTime();
    console.log(`Membaca dataset : ${detik( waktu.selesaiMembacaData - waktu.mulai )} detik`)
    console.log(`Konversi data : ${detik(waktu.selesaiKonversiData - waktu.selesaiMembacaData)} detik`)
    console.log(`Clustering data : ${detik(waktu.selesaiClusteringData - waktu.selesaiKonversiData)} detik`)
    console.log(`Menulis hasil : ${detik(waktu.selesaiMenulisData - waktu.selesaiClusteringData)} detik`)
    console.log(`Waktu total : ${detik(waktu.selesaiMenulisData - waktu.mulai)} detik`)
    console.log('Proses Clustering Selesai, silahkan cek file hasilClustering.xlsx');
}

function setelahMembacaData(){
    data.shift();
    waktu.selesaiMembacaData = new Date().getTime();

    let vectors = [];
    for (let i in data) {
         vectors.push(JSON.parse(JSON.stringify(data[i])));
         vectors[i].shift();
    }

    waktu.selesaiKonversiData = new Date().getTime();
    kmeans.clusterize(vectors, {k:3}, (err,res) => {
        hasil = res;
        setelahProsesCluster()
    });
}

(async function(){
    waktu.mulai = new Date().getTime();
    const book = new excelJS.Workbook();
    await book.xlsx.readFile('Mall_customer.xlsx');
    book.eachSheet(function(worksheet, sheetId) {
        worksheet.eachRow(function(row, rowNumber) {
            data.push(Object.keys(row.values).map((key) => row.values[key]) )
            jikaSelesai(15, setelahMembacaData)
        });
    });

})()