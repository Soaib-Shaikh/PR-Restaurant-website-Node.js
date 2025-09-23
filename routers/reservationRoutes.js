const { Router } = require("express");

const { reserveTablePage, reserveTable, reservationConfirm, updateStatus, myReservations } = require('../controllers/reservation.Controller')
const router = Router();

router.get('/', reserveTablePage);
router.post('/', reserveTable);

router.get('/success/:id', reservationConfirm);

router.get('/my', myReservations);

router.post('/update/:id', updateStatus);

module.exports = router;