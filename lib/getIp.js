var getIp = require('local-ip');
const interface = "eth0"

getIp(interface, (err, res) => {
  if (err)
    return console.log(err);

  return res
});

module.exports = getIp()


