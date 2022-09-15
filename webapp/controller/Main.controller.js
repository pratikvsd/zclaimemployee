sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("safetysuitezclaimemployee.controller.Main", {
		
		init: function(){},
		
		openClaimWizard:function(oEvent){
			if(!this.claimWizardDialog){
				this.claimWizardDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.claimWizard",this);
				this.getView().addDependent(this.claimWizardDialog);
			}
			this.claimWizardDialog.open();
		},
		
		handleNavigationChange: function (oEvent) {
			this._oSelectedStep = oEvent.getParameter("step");
			this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
			this.handleButtonsVisibility();
		},
		
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
			this.claimWizardDialog.close();
		}


		
	});
});