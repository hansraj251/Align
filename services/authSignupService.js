const db =
    require("../db");

const defaultSetupService =
    require("./defaultSetupService");
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
           
                   db.run(
                       `
                       INSERT INTO restaurant_settings
           (
               restaurant_id,
               footer_message,
               cgst,
               sgst,
               currency,
               time_zone
           )
           VALUES (?, ?, ?, ?, ?, ?)
                       `,
                       [
               restaurantId,
               "Thank You! Visit Again.",
               2.5,
               2.5,
               "INR",
               "Asia/Kolkata"
           ],
                       function (err) {
           
                           if (err) {
           
                               return reject(err);
           
                           }
                           
              defaultSetupService
               .ensureDefaultTakeAway(
                   restaurantId
               )
               .then(() => {
           
                   resolve({

    restaurantId,

    userId

});
           
               })
               .catch(err => {

    reject(err);

});
           
                       }
                   );
           
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