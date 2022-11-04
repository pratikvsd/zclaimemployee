sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"safetysuitezclaimemployee/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("safetysuitezclaimemployee.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			var oUserModel = new sap.ui.model.json.JSONModel();
            if (sap.ushell.Container) {
                this._UserID = sap.ushell.Container.getService("UserInfo").getId();
            } else {
                this._UserID = "JPRAKASH";
            }
            oUserModel.setData({
                "UserId" : this._UserID
            });
            sap.ui.getCore().setModel(oUserModel, "userModel");
		}
	});
});