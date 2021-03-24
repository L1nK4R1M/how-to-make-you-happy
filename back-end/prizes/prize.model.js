const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
        cost: { type: DataTypes.INTEGER, allowNull: false },
        category: { type: DataTypes.INTEGER, allowNull: false },
        picture: { type: DataTypes.STRING, allowNull: true },
        already_won: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        won_date: { type: DataTypes.DATE, allowNull: true },
        time_end: { type: DataTypes.DATE, allowNull: false },
        time_end_24h: { 
            type: DataTypes.VIRTUAL(DataTypes.DATE, ['time_end']),
            get: function() {
                timeEnd24h = new Date(this.get('time_end')).getTime();
                timeEnd24h += (24 * 60 * 60 * 1000);
                return new Date(timeEnd24h);
            }
    },
        countdown_time: { type: DataTypes.BIGINT, allowNull: false },
        user: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
    };

    return sequelize.define('Prize', attributes);
}