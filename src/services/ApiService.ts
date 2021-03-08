import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";

class ApiService {
  public getObjectives(listName) {
    return sp.web.lists.getByTitle(listName).items.get();
  }
  public getObjective(listName, ID) {
    return sp.web.lists.getByTitle(listName).items.getById(ID).get();
  }

  public add(listName, object) {
    return sp.web.lists.getByTitle(listName).items.add(object);
  }
  public edit(listName, object, ID) {
    return sp.web.lists.getByTitle(listName).items.getById(ID).update(object);
  }
  public gettype(listName) {
    let list = sp.web.lists.getByTitle(listName);
    return list.fields
      .getByInternalNameOrTitle("ProgressType")
      .select("Choices")
      .get();
  }
  public delete(listName, ID) {
    let list = sp.web.lists.getByTitle(listName);

    return list.items.getById(ID).delete();
  }
  public deleteMultiple(listName, ID) {
    var batch = sp.createBatch();
    let list = sp.web.lists.getByTitle(listName);

    return list.items
      .filter("ObjectiveID eq '" + ID + "'")
      .get()
      .then((items) => {
        items.forEach((i) => {
          list.items
            .getById(i["ID"])
            .inBatch(batch)
            .delete()
            .then((r) => {
              console.log("deleted");
            });
        });
        batch.execute().then(() => console.log("All deleted"));
      });
  }
}
export default new ApiService();
