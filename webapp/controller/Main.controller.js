sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("safetysuitezclaimemployee.controller.Main", {
		
		//All the methods have been written the flow of the application.
		
		init: function(){
			this.WizardTitle = ""; // This is important flag which is used below to close the dialogs
		},
		
		openInjuryTab: function(){
				if(!this.InjuryTabDialog){
				this.InjuryTabDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.InjuryTable",this);
				this.getView().addDependent(this.InjuryTabDialog);
				
			}
			this.WizardTitle = "InjuryTab";
			this.InjuryTabDialog.open();
		}, // To open the initial injury Table dialog
		
		openPrivacyStatementTab : function(){
				if(!this.PrivacyStatementDialog){
				this.PrivacyStatementDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.PrivacyStatement",this);
				this.getView().addDependent(this.PrivacyStatementDialog);
				
			}
			this.PrivacyStatementDialog.open();
		}, // To open the privacy statement dialog
		
		openClaimWizard:function(oEvent){
			
			if(!this.claimWizardDialog){
				this.claimWizardDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.claimWizard",this);
				this.getView().addDependent(this.claimWizardDialog);
				
			}
			this.WizardTitle = "StartClaim";
			this.claimWizardDialog.open();
			this.PrivacyStatementDialog.close();
		}, // To open the main wizard dialog
		
		onDialogNextButton: function () {
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
		},
		
		onDialogBackButton: function () {
			this._iSelectedStepIndex = this._oWizard.getCurrentStep();
			var oPreviousStep = this._oWizard.getSteps()[this._iSelectedStepIndex - 1];

			if (this._oSelectedStep) {
				this._oWizard.goToStep(oPreviousStep, true);
			} else {
				this._oWizard.previousStep();
			}

			this._iSelectedStepIndex--;
			this._oSelectedStep = oPreviousStep;
		},
		
		handleWizardCancel: function(oEvent){
			if(this.WizardTitle === "StartClaim"){
				this.claimWizardDialog.close();
				this.WizardTitle = "InjuryTab";
			}
			else if(this.WizardTitle === "InjuryTab"){
				this.InjuryTabDialog.close();
			}
			
		}


		
	});
});