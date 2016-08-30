var logger = require('../utils/logger');

function ProxyStrategy(strategy) {
    logger.info('Using ' + strategy + ' strategy');
    this.strategy = require('./' + strategy + '-proxy-strategy');
}

ProxyStrategy.prototype.listen = function(options) {
    this.strategy.listen(options);
}


module.exports = ProxyStrategy;