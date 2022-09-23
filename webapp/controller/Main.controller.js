sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/UploadCollectionParameter"
], function(Controller, UploadCollectionParameter) {
	"use strict";

	return Controller.extend("safetysuitezclaimemployee.controller.Main", {

		//All the methods have been written in the flow of the application.

		onInit: function() {
			this.WizardTitle = ""; // This is important flag which is used below to close the dialogs
		},

		openInjuryTab: function() {
			if (!this.InjuryTabDialog) {
				this.InjuryTabDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.InjuryTable", this);
				this.getView().addDependent(this.InjuryTabDialog);

			}
			this.WizardTitle = "InjuryTab";
			this.InjuryTabDialog.open();

		}, // To open the initial injury Table dialog.
		
		onCreateIncidentPress: function(oEvent){
			window.open( "https://sapsdev.c-net.com.au/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#CNet-MyIncidents","_blank");
		}, //To open create incident app in new window.

		openPrivacyStatementTab: function() {
			if (!this.PrivacyStatementDialog) {
				this.PrivacyStatementDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.PrivacyStatement", this);
				this.getView().addDependent(this.PrivacyStatementDialog);

			}
			this.WizardTitle = "PrivacyDialog";
			this.PrivacyStatementDialog.open();
		}, // To open the privacy statement dialog.

		openClaimWizard: function(oEvent) {

			if (!this.claimWizardDialog) {
				this.claimWizardDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.claimWizard", this);
				this.getView().addDependent(this.claimWizardDialog);

			}
			this.WizardTitle = "StartClaim";
			this.claimWizardDialog.open();
			if(sap.ui.getCore().byId("claimFormWizard").getCurrentStep() === "personalDetailStep"){
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
			}
			this.PrivacyStatementDialog.close();
			this.InjuryTabDialog.close();
			sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
			sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);
			sap.ui.getCore().byId("injuryTabCreateIncBtn").setEnabled(false);
		}, // To open the main wizard dialog.

		onDialogNextButton: function() {
			this._oWizard = sap.ui.getCore().byId("claimFormWizard");
			this._iSelectedStepIndex = this._oWizard.getCurrentStep();
			var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

			if (this._oSelectedStep && !this._oSelectedStep.bLast) {
				this._oWizard.goToStep(oNextStep, true);

			} else {
				this._oWizard.nextStep();
			}
			this._iSelectedStepIndex++;
			this._oSelectedStep = oNextStep;

			if (this._oWizard.getCurrentStep() === "attachmentStep") {
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
			} else if (this._oWizard.getCurrentStep() === "personalDetailStep") {
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
			} else {
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
			}
		}, // Code for next button in the main claim wizard control.

		onDialogBackButton: function() {
			this._iSelectedStepIndex = this._oWizard.getCurrentStep();
			var oPreviousStep = this._oWizard.getSteps()[this._iSelectedStepIndex - 1];

			if (this._oSelectedStep) {
				this._oWizard.goToStep(oPreviousStep, true);
			} else {
				this._oWizard.previousStep();
			}
			if (this._oWizard.getCurrentStep() === "attachmentStep") {
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
			} else if (this._oWizard.getCurrentStep() === "personalDetailStep") {
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
			} else {
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
			}

			this._iSelectedStepIndex--;
			this._oSelectedStep = oPreviousStep;
		}, // Code for previous button in the main claim wizard control.

		handleWizardCancel: function(oEvent) {
			if (this.WizardTitle === "StartClaim") {
				this.claimWizardDialog.close();
				this._oWizard.setCurrentStep("personalDetailStep");
				this.WizardTitle = "InjuryTab";
			} else if (this.WizardTitle === "InjuryTab") {
				this.InjuryTabDialog.close();
				sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
				sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);
				sap.ui.getCore().byId("injuryTabCreateIncBtn").setEnabled(false);

			} else if (this.WizardTitle === "PrivacyDialog") {
				this.PrivacyStatementDialog.close();
			}

		}, // General method for closing the popup dialogs. 

		onInjuryTableRowSelect: function(oiEvent) {
			sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(true);
			sap.ui.getCore().byId("injuryTabCreateIncBtn").setEnabled(true);
		}, // To enable the the button in Injury table on click on row.

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		}, // Mandotory event to set the header parameter for upload collection.
		
		onUploadComplete: function(oEvent) {
			var oUploadCollection = sap.ui.getCore().byId("UploadCollection");
			var oData = oUploadCollection.getModel().getData();
			var url = sap.ui.require.toUrl("safetysuitezclaimemployee/Attachment_Sample_Files/IdentityProof.png");
			oData.items.unshift({
				"documentId": jQuery.now().toString(), // generate Id,
				"fileName": oEvent.getParameter("files")[0].fileName,
				"mimeType": "",
				"thumbnailUrl": "",
				"url": url,
				"attributes": [{
					"title": "Uploaded By",
					"text": "You",
					"active": false
				}, {
					"title": "Uploaded On",
					"text": new Date(jQuery.now()).toLocaleDateString(),
					"active": false
				}, {
					"title": "File Size",
					"text": "505000",
					"active": false
				}]
			});
			this.getView().getModel().refresh();

			// Sets the text to the label
			var aItems = sap.ui.getCore().byId("UploadCollection").getItems();
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments("+ aItems.length +")");

			// delay the success message for to notice onChange message
			setTimeout(function() {
				sap.m.MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		}, // For file upload process.

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			//sap.m.MessageToast.show("BeforeUploadStarts event triggered.");
		}, //Madotory event for before file upload.
		
		deleteAttachmentListItems: function(oEvent) {
			var sItemToDeleteId = oEvent.getParameter("documentId");
			var oData = sap.ui.getCore().byId("UploadCollection").getModel().getData();
			var aItems = jQuery.extend(true, {}, oData).items;
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			sap.ui.getCore().byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			var Items = sap.ui.getCore().byId("UploadCollection").getItems();
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments("+ Items.length +")");
		}, // To delete the files from the attchment list.
		
		onPressSubmitButton : function(){
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: new sap.m.Text({ text: "Do you want to submit this claim?" }),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Submit",
						press: function () {
							var sSource = sap.ui.require.toUrl("safetysuitezclaimemployee/Attachment_Sample_Files/2056106_E_20220914.pdf");
							this.oApproveDialog.close();
							this.claimWizardDialog.close();
							this._oWizard.setCurrentStep("personalDetailStep");
							this._pdfViewer = new sap.m.PDFViewer();
							this.getView().addDependent(this._pdfViewer);
							this._pdfViewer.setSource(sSource);
							this._pdfViewer.setTitle("Details of Claim Form");
							this._pdfViewer.open();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
			
		}, // Submit button functionality
		
		onPressSaveDraftButton: function(){
			sap.m.MessageToast.show("Claim has been saved as draft");
			this.claimWizardDialog.close();
			this._oWizard.setCurrentStep("personalDetailStep");
		} // Save as draft button functionality

	});
});