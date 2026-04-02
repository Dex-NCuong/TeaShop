const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderDetail = sequelize.define('OrderDetail', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.BIGINT,
        field: 'order_id'
    },
    productId: {
        type: DataTypes.BIGINT,
        field: 'product_id'
    },
    price: DataTypes.DOUBLE,
    quantity: DataTypes.INTEGER
}, {
    tableName: 'order_details',
    timestamps: false
});

module.exports = OrderDetail;
