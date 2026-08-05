const db =
    require("../db");

async function createRestaurantAccount(
    signupData
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

           db.run(
               `INSERT INTO restaurants
           (
               name,
               owner_name,
               email,
               mobile,
               status,
               plan_id,
               subscription_status,
               plan_start,
               plan_end,
               trial_used
           )
           VALUES
           (
               ?, ?, ?, ?, ?,
               (
                   SELECT id
                   FROM plans
                   WHERE slug = 'plus'
               ),
               ?,
               DATE('now'),
               DATE('now', '+30 days'),
               ?
           )`,
               [
               signupData.restaurantName,
               signupData.ownerName,
              signupData.email,
              signupData.mobile,
               "active",
               "trial",
               1
           ],
               function (err) {
           
                   if (err) {
                       return reject(err);
                   }
           
           const restaurantId = this.lastID;
           const restaurantCode =
               `ALN${String(restaurantId).padStart(6, "0")}`;
           
           db.run(
               `
               UPDATE restaurants
               SET restaurant_code = ?
               WHERE id = ?
               `,
               [
                   restaurantCode,
                   restaurantId
               ],
               function (err) {
           
                   if (err) {
           
                       return reject(err);
           
                   }
           
               }
           );
           db.run(
               `INSERT INTO users
               (
                   restaurant_id,
                   name,
                   email,
                   mobile,
                   password,
                   role,
                   status
               )
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
               [
                   restaurantId,
                   signupData.ownerName,
                   signupData.email,
                   signupData.mobile,
                   signupData.passwordHash,
                   "owner",
                   "active"
               ],
               function (err) {
           
                   if (err) {
                       return reject(err);
                   }
           
                   const userId = this.lastID;
           
                  resolve({

    restaurantId,

    userId

});
           
               }
           );
               }
           );

        }
    );

}

module.exports = {

    createRestaurantAccount

};    