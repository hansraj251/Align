const repository =
    require("../repositories/systemMenuItemRepository");

exports.search =
async (
    keyword
)=>{

    return{

        success:true,

        items:

            await repository.search(
                keyword
            )

    };

};