const http = require('http');

http.get('http://localhost:3000/api/news', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.data && json.data.past && json.data.past.length > 0) {
                console.log(JSON.stringify(json.data.past[0], null, 2));
            } else {
                console.log('No past data found');
            }
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
        }
    });
}).on('error', (err) => {
    console.log('Error: ' + err.message);
});
