const nodemailer = require('nodemailer');
const mail = require('./mail');
const csv = require('csvtojson');
const csvFile = './test.csv';
const mysql = require('mysql');
const sleep = require('util').promisify(setTimeout);


const connection = mysql.createConnection({
    host     : '172.16.86.222',
    user     : 'dbUser',
    password : 'dbPassword',
    database : 'dbName'
});

const connectionOnsite = mysql.createConnection({
    host     : '172.16.86.222',
    user     : 'dbUser',
    password : 'dbPassword',
    database : 'onsiteDbName'
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'acm@bitmesra.ac.in',
        pass: 'password'
    }
});

function generatePassword() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }


async function sendMail(options) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if(err) {
                reject(err);
            }
            else {
                console.log(`Mail sent to ${options.to}`);
                resolve();
            }
         });
    });
}

async function insertTeam(team) {
    return new Promise((resolve, reject) => {
        connectionOnsite.query('INSERT INTO teams SET ?', team, (err, res, fields) => {
            if(err) reject(err);
            console.log(`Team ${team.teamname} inserted into database`);
            resolve();
        });
    });
}

connection.query(`Select * from teams`, (err, res, fields) => {
    if(err) throw err;
    let result = res;
    csv().fromFile(csvFile)
    .then(async function(jsonArray){
        let teamnames = jsonArray.map(data => data.teamname);

        for(let team = 0; team < res.length; team++) {
            if(teamnames.indexOf(res[team].teamname) > -1) {

                // Map group ids of online to onsite round.

                if(res[team].gid === 9) {
                    res[team].gid = 2;
                }

                if(res[team].gid === 10) {
                    res[team].gid = 3;
                }

                if(res[team].gid === 11) {
                    res[team].gid = 4;
                }

                if(res[team].gid === 12) {
                    res[team].gid = 5;
                }

                let password = generatePassword();

                res[team].pass = password;
                res[team].score = 0;
                res[team].penalty = 0;
                res[team].tid += 6886;

                try {

                    await insertTeam(res[team]);

                    const mailOptions = {
                        from: 'acm@bitmesra.ac.in', 
                        to: res[team].email1, 
                        subject: 'ACM Prelims Selection',
                        html: mail.body(res[team].name1, res[team].teamname, res[team].pass)
                    };

                    await sendMail(mailOptions);

                    await sleep(1000);
                } catch (e) {
                    console.error(`ERROR - ${e}`);
                }
            }
        }
        connectionOnsite.end();
        connection.end();
    });
});