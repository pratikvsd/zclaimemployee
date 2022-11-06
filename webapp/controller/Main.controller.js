sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/Wizard-dbg",
	"sap/ui/Device",
	"sap/m/WizardProgressNavigator",
	"sap/m/WizardRenderer"
], function(Controller, UploadCollectionParameter, Device) {
	"use strict";
	var userDetailModel = new sap.ui.model.json.JSONModel();
	var AttachmentModel = new sap.ui.model.json.JSONModel();

	return Controller.extend("safetysuitezclaimemployee.controller.Main", {

		//All the methods have been written in the flow of the application.

		onInit: function() {
			this.DraftId = "";
			var oUserModel = new sap.ui.model.json.JSONModel();
            if (sap.ushell.Container) {
                this.userName = sap.ushell.Container.getService("UserInfo").getId();
            } else {
                this.userName = "JPRAKASH";
            }
            oUserModel.setData({
                "UserId" : this._UserID
            });
            sap.ui.getCore().setModel(oUserModel, "userModel");
			this.WizardTitle = ""; // This is important flag which is used below to close the dialogs
			this.attachmentsId = [];
			this.getView().setModel(userDetailModel, "userDetailModel");
			this.getView().setModel(AttachmentModel, "AttachmentModel");
			var draftRecords = [];
			var that = this;
			var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/cnetohs/VWA_CLAIM_SRV");
			oModel.read("/InjuryDetail", {
				success: function(oData, oResponse) {
					draftRecords = oData.results;
					if (draftRecords.length > 1) {
						if (!that.MultipleDraftDialog) {
							that.MultipleDraftDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.MultipleDraftRecords", that);
							that.getView().addDependent(that.MultipleDraftDialog);
						}
						var multipleDraftModel = new sap.ui.model.json.JSONModel(draftRecords);
						that.getView().setModel(multipleDraftModel, "multipleDraftModel");
						that.MultipleDraftDialog.open();
					} else if (draftRecords.length === 1) {
						if (!that.DraftDialog) {
							that.DraftDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.saveAsDraft", that);
							that.getView().addDependent(that.DraftDialog);
						}
						that.DraftDialog.open();
						that.DraftId = draftRecords[0].Draftid;
					} else {
						oModel.read("/UserDetail('" + that.userName + "')", {
							success: function(userData, userResponse) {
								if (userData !== undefined || userData !== null) {
									that.ManagerPernr = userData.ManagerPernr;
									userDetailModel.setData(userData);
									that.getView().setModel(userDetailModel, "userDetailModel");
									sap.ui.getCore().setModel(userDetailModel, "userDetailModel");
								}
							},
							error: function(error) {
								console.log(error);
							}
						});

					}
				},
				error: function(error) {

				}
			});
			// roughString variable is used for storing the string of blank signature box and its used below for validation.
			this.roughString =
				"ZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvNGdJb1NVTkRYMUJTVDBaSlRFVUFBUUVBQUFJWUFBQUFBQVF3QUFCdGJuUnlVa2RDSUZoWldpQUFBQUFBQUFBQUFBQUFBQUJoWTNOd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUE5dFlBQVFBQUFBRFRMUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBbGtaWE5qQUFBQThBQUFBSFJ5V0ZsYUFBQUJaQUFBQUJSbldGbGFBQUFCZUFBQUFCUmlXRmxhQUFBQmpBQUFBQlJ5VkZKREFBQUJvQUFBQUNoblZGSkRBQUFCb0FBQUFDaGlWRkpEQUFBQm9BQUFBQ2gzZEhCMEFBQUJ5QUFBQUJSamNISjBBQUFCM0FBQUFEeHRiSFZqQUFBQUFBQUFBQUVBQUFBTVpXNVZVd0FBQUZnQUFBQWNBSE1BVWdCSEFFSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFGaFpXaUFBQUFBQUFBQnZvZ0FBT1BVQUFBT1FXRmxhSUFBQUFBQUFBR0taQUFDM2hRQUFHTnBZV1ZvZ0FBQUFBQUFBSktBQUFBK0VBQUMyejNCaGNtRUFBQUFBQUFRQUFBQUNabVlBQVBLbkFBQU5XUUFBRTlBQUFBcGJBQUFBQUFBQUFBQllXVm9nQUFBQUFBQUE5dFlBQVFBQUFBRFRMVzFzZFdNQUFBQUFBQUFBQVFBQUFBeGxibFZUQUFBQUlBQUFBQndBUndCdkFHOEFad0JzQUdVQUlBQkpBRzRBWXdBdUFDQUFNZ0F3QURFQU52L2JBRU1BQXdJQ0FnSUNBd0lDQWdNREF3TUVCZ1FFQkFRRUNBWUdCUVlKQ0FvS0NRZ0pDUW9NRHd3S0N3NExDUWtORVEwT0R4QVFFUkFLREJJVEVoQVREeEFRRVAvYkFFTUJBd01EQkFNRUNBUUVDQkFMQ1FzUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFUC9BQUJFSUFNZ0F5QU1CSWdBQ0VRRURFUUgveEFBVkFBRUJBQUFBQUFBQUFBQUFBQUFBQUFBQUNmL0VBQlFRQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUQveEFBVUFRRUFBQUFBQUFBQUFBQUFBQUFBQUFBQS84UUFGQkVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBUC9hQUF3REFRQUNFUU1SQUQ4QXFtQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUQvOWs9";

		},

		openInjuryTab: function() {
			var that = this;
			if (this.MultipleDraftDialog || this.DraftDialog) {
				this.getView().getModel().read("/UserDetail('" + this.userName + "')", {
					success: function(oData, oResponse) {
						if (oData !== undefined || oData !== null) {
							that.getView().getModel("userDetailModel").setData(oData);
							that.getView().setModel(userDetailModel, "userDetailModel");
							that.DraftId = "";
						}
					},
					error: function(error) {
						console.log(error);
					}
				});
			}

			if (!this.InjuryTabDialog) {
				this.InjuryTabDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.InjuryTable", this);
				this.getView().addDependent(this.InjuryTabDialog);

			}
			this.WizardTitle = "InjuryTab";
			this.InjuryTabDialog.open();
			if (this.DraftDialog) {
				this.DraftDialog.close();
			}

		}, // To open the initial injury Table dialog.

		onCreateIncidentPress: function(oEvent) {
			//var urlString = document.location.href.split("/");
			//var host = urlString[2];
			//window.open("https://" + host + "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#CNet-MyIncidents", "_blank");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.isIntentSupported(["CNet-MyIncidents"])
				.done(function(aResponses) {

				})
				.fail(function() {
					new sap.m.MessageToast("Provide corresponding intent to navigate");
				});
			// generate the Hash to display a employee Id
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "CNet",
					action: "MyIncidents"
				}
			})) || "";
			//Generate a  URL for the second application
			var url = window.location.href.split('#')[0] + hash;
			//Navigate to second app
			sap.m.URLHelper.redirect(url, true);
			//window.open("https://sapsdev.c-net.com.au/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#CNet-MyIncidents", "_blank");
		}, //To open create incident app in new window.

		openPrivacyStatementTab: function() {
			this.ConfidentialColumnText = sap.ui.getCore().byId("injuryDetailsTable").getSelectedItem().getCells()[5].getText();
			this.InjurTypeNumber = sap.ui.getCore().byId("injuryDetailsTable").getSelectedItem().getCells()[6].getText();
			if (!this.PrivacyStatementDialog) {
				this.PrivacyStatementDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.PrivacyStatement", this);
				this.getView().addDependent(this.PrivacyStatementDialog);

			}
			this.WizardTitle = "PrivacyDialog";
			this.PrivacyStatementDialog.open();
		}, // To open the privacy statement dialog.

		openClaimWizard: function(oEvent) {
			var that = this;

			if (!this.claimWizardDialog) {
				this.claimWizardDialog = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.claimWizard", this);
				this.getView().addDependent(this.claimWizardDialog);
				sap.ui.getCore().byId("html").setContent("<canvas id='signature-pad' width='200px' height='200px' class='signature-pad'></canvas>");

			}
			this.WizardTitle = "StartClaim";
			this.claimWizardDialog.open();
			this.onSign();
			if (oEvent.getSource().getId() === "contAsDraftBtn") {

				if (this.MultipleDraftDialog) {
					this.DraftId = sap.ui.getCore().byId("MultipleDraftTable").getSelectedItem().getCells()[3].getText();
					var draftid = this.DraftId;
					var username = this.userName;
					username = new sap.ui.model.Filter("Userid", "EQ", username);
					draftid = new sap.ui.model.Filter("Draftid", "EQ", draftid);
					var filters = [draftid, username];
					this.getView().getModel().read("/SaveDraftDetailsSet(Userid='" + this.userName + "',Draftid='" + this.DraftId + "')", {
						success: function(oData, oResponse) {
							if (oData !== undefined || oData !== null) {
								oData.Signature = atob(oData.Signature);
								oData.Attachments = oData.Attachments.split(",");
								that.attachmentsId.push(oData.Attachments);
								that.ManagerPernr = oData.ManagerPernr;
								var c = document.getElementById("signature-pad");
								var context = c.getContext("2d");
								var base_image = new Image();
								base_image.src = oData.Signature;
								base_image.onload = function() {
									context.fillStyle = "#fff";
									context.strokeStyle = "#444";
									context.lineWidth = 1.5;
									context.lineCap = "round";
									context.fillRect(0, 0, c.width, c.height);
									context.drawImage(base_image, 0, 0);
								};
								if (oData.TabNo !== undefined) {
									if (oData.TabNo === "1") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("personalDetailStep");
										sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
										sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
									} else if (oData.TabNo === "2") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("injuryDetailStep");
									} else if (oData.TabNo === "3") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("employmentDetailStep");
									} else if (oData.TabNo === "4") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("workerEarningStep");
									} else if (oData.TabNo === "5") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("returntoWorkStep");
									} else if (oData.TabNo === "6") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("workerDecStep");
									} else if (oData.TabNo === "7") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("attachmentStep");
										sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
										sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
										sap.ui.getCore().byId("claimSubmitBtn").setEnabled(true);
									}
								}
								userDetailModel.setData(oData);
								that.getView().setModel(userDetailModel, "userDetailModel");
							}
						},
						error: function(error) {
							console.log(error);
						}
					});
					this.MultipleDraftDialog.close();
				} else if (this.DraftDialog) {
					var draftid = this.DraftId;
					var username = this.userName;
					username = new sap.ui.model.Filter("Userid", "EQ", username);
					draftid = new sap.ui.model.Filter("Draftid", "EQ", draftid);
					var filters = [draftid, username];
					this.getView().getModel().read("/SaveDraftDetailsSet(Userid='" + this.userName + "',Draftid='" + this.DraftId + "')", {
						success: function(oData, oResponse) {
							if (oData !== undefined || oData !== null) {
								oData.Signature = atob(oData.Signature);
								oData.Attachments = oData.Attachments.split(",");
								that.attachmentsId.push(oData.Attachments);
								that.ManagerPernr = oData.ManagerPernr;
								userDetailModel.setData(oData);
								that.getView().setModel(userDetailModel, "userDetailModel");
								var c = document.getElementById("signature-pad");
								var context = c.getContext("2d");
								var base_image = new Image();
								base_image.src = oData.Signature;
								base_image.onload = function() {
									context.fillStyle = "#fff";
									context.strokeStyle = "#444";
									context.lineWidth = 1.5;
									context.lineCap = "round";
									context.fillRect(0, 0, c.width, c.height);
									context.drawImage(base_image, 0, 0);
								};
								if (oData.TabNo !== undefined) {
									if (oData.TabNo === "1") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("personalDetailStep");
										sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
										sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
									} else if (oData.TabNo === "2") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("injuryDetailStep");
									} else if (oData.TabNo === "3") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("employmentDetailStep");
									} else if (oData.TabNo === "4") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("workerEarningStep");
									} else if (oData.TabNo === "5") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("returntoWorkStep");
									} else if (oData.TabNo === "6") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("workerDecStep");
									} else if (oData.TabNo === "7") {
										sap.ui.getCore().byId("claimFormWizard").setCurrentStep("attachmentStep");
										sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
										sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
										sap.ui.getCore().byId("claimSubmitBtn").setEnabled(true);
									}
								}
							}
						},
						error: function(error) {
							console.log(error);
						}
					});
					this.DraftDialog.close();
				}
				this.getView().getModel().read("/Files", {
					filters: filters,
					success: function(oData, response) {
						for (var i = 0; i < oData.results.length; i++) {
							oData.results[i].url = that.getView().getModel().sServiceUrl + "/Files(ArcDocId='" + oData.results[i].ArcDocId +
								"',Draftid='',Userid='" + that.userName + "')/$value";
						}
						AttachmentModel.setData(oData.results);
						sap.ui.getCore().byId("UploadCollection").setModel(AttachmentModel, "AttachmentModel");

					},
					error: function(oError) {

					}
				}); //reading files for draft

			}
			if (this.DraftDialog) {
				this.DraftDialog.close();
			}
			if (this.MultipleDraftDialog) {
				this.MultipleDraftDialog.close();
			}
			sap.ui.getCore().byId("UploadCollection").setUploadUrl("/sap/opu/odata/cnetohs/VWA_CLAIM_SRV/Files");
			sap.ui.getCore().byId("UploadCollection").setModel(AttachmentModel, "AttachmentModel");
			sap.ui.getCore().byId("claimFormWizard")._getProgressNavigator().ontap = function() {};
			sap.ui.getCore().byId("claimFormWizard")._scrollHandler = function(e) {

				if (this._scrollLocked) {
					return;
				}
				if (Device.browser === undefined) {
					var scrollTop = document.documentElement.querySelector(".sapMWizardStepContainer").scrollTop;
				} else {
					var scrollTop = event.target.scrollTop;
				}

				var progressNavigator = this._getProgressNavigator(),
					currentStepDOM = this._stepPath[progressNavigator.getCurrentStep() - 1].getDomRef();

				if (!currentStepDOM) {
					return;
				} else {
					var wizardStep = currentStepDOM.dataset.sapUi;
					if (wizardStep === "attachmentStep") {
						sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
						sap.ui.getCore().byId("claimSubmitBtn").setEnabled(true);
					} else if (wizardStep === "personalDetailStep") {
						sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
						sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
					} else {
						sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
						sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
						sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
					}
					sap.ui.getCore().byId("claimFormWizard").setCurrentStep(wizardStep);
				}

				var stepHeight = currentStepDOM.clientHeight,
					stepOffset = currentStepDOM.offsetTop,
					stepChangeThreshold = 100;

				if (scrollTop + stepChangeThreshold >= stepOffset + stepHeight && progressNavigator._isActiveStep(progressNavigator._currentStep +
						1)) {
					progressNavigator.nextStep();
				}

				var aSteps = this.getSteps();
				// change the navigator current step
				for (var index = 0; index < aSteps.length; index++) {
					if (scrollTop + stepChangeThreshold <= stepOffset) {
						progressNavigator.previousStep();

						// update the currentStep reference
						currentStepDOM = this._stepPath[progressNavigator.getCurrentStep() - 1].getDomRef();

						if (!currentStepDOM) {
							break;
						}

						stepOffset = currentStepDOM.offsetTop;
					}
				}
			};

			if (sap.ui.getCore().byId("claimFormWizard").getCurrentStep() === "personalDetailStep") {
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
			}
			if (this.PrivacyStatementDialog) {
				this.PrivacyStatementDialog.close();
			}

			if (this.InjuryTabDialog) {
				sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
				sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);
				this.InjuryTabDialog.close();
			}

			if (this.ConfidentialColumnText === "Yes") {
				if (!this.confidentialPopup) {
					this.confidentialPopup = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.confidentialPopup", this);
					this.getView().addDependent(this.confidentialPopup);
				}
				this.confidentialPopup.open();
			}
		}, // To open the main wizard dialog.

		onDialogNextButton: function() {
			this._oWizard = sap.ui.getCore().byId("claimFormWizard");
			this._iSelectedStepIndex = this._oWizard.getCurrentStep();
			var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

			if (this._oWizard.getCurrentStep() === "personalDetailStep") {
				var InputTitle = sap.ui.getCore().byId("InputTitle");
				var InputFamilyName = sap.ui.getCore().byId("InputFamilyName");
				var InputGivenName = sap.ui.getCore().byId("InputGivenName");

				if (InputTitle.getValue() === "" || InputFamilyName.getValue() === "" || InputGivenName.getValue() === "") {
					InputTitle.setValueState("Error");
					InputFamilyName.setValueState("Error");
					InputGivenName.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}

			} else if (this._oWizard.getCurrentStep() === "injuryDetailStep") {
				var InputInjuryDateTime = sap.ui.getCore().byId("InputInjuryDateTime");
				var InputStoppedWorkDateTIme = sap.ui.getCore().byId("InputStoppedWorkDateTIme");
				if (InputInjuryDateTime.getValue() === "" || InputStoppedWorkDateTIme.getValue() === "") {
					if (InputInjuryDateTime.getValue() === "" && InputStoppedWorkDateTIme.getValue() === "") {
						InputInjuryDateTime.setValueState("Error");
						InputStoppedWorkDateTIme.setValueState("Error");
					} else if (InputInjuryDateTime.getValue() === "") {
						InputInjuryDateTime.setValueState("Error");
					} else if (InputStoppedWorkDateTIme.getValue() === "") {
						InputStoppedWorkDateTIme.setValueState("Error");
					}
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "employmentDetailStep") {
				var InputEmpAppliesToYou = sap.ui.getCore().byId("InputEmpAppliesToYou");
				if (InputEmpAppliesToYou.getSelectedKey() === "" || InputEmpAppliesToYou.getSelectedKey() === undefined) {
					InputEmpAppliesToYou.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "workerEarningStep") {
				var InputWorkerWeeklyShiftAllowence = sap.ui.getCore().byId("InputWorkerWeeklyShiftAllowence");
				var InputWorkerWeeklyOvertime = sap.ui.getCore().byId("InputWorkerWeeklyOvertime");
				if (InputWorkerWeeklyShiftAllowence.getValue() === "" || InputWorkerWeeklyOvertime.getValue() === "") {
					if (InputWorkerWeeklyShiftAllowence.getValue() === "" && InputWorkerWeeklyOvertime.getValue() === "") {
						InputWorkerWeeklyShiftAllowence.setValueState("Error");
						InputWorkerWeeklyOvertime.setValueState("Error");
					} else if (InputWorkerWeeklyShiftAllowence.getValue() === "") {
						InputWorkerWeeklyShiftAllowence.setValueState("Error");
					} else if (InputWorkerWeeklyOvertime.getValue() === "") {
						InputWorkerWeeklyOvertime.setValueState("Error");
					}

				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "workerDecStep") {
				var canvas = document.getElementById("signature-pad");
				this.signString = btoa(encodeURI(canvas.toDataURL('image/jpeg').replace("data:image/jpeg:base64,", "")));
				var InputDeclarationDate = sap.ui.getCore().byId("InputDeclarationDate");
				if (InputDeclarationDate.getValue() === "" || InputDeclarationDate.getValue() === undefined) {
					InputDeclarationDate.setValueState("Error");
				} else if (this.roughString === this.signString) {
					canvas.style.borderColor = "red";
				} else {
					canvas.style.borderColor = "black";
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}

				}
			} else {
				if (this._oSelectedStep && !this._oSelectedStep.bLast) {
					this._oWizard.goToStep(oNextStep, true);

				} else {
					this._oWizard.nextStep();
				}
			}
			this._iSelectedStepIndex++;
			this._oSelectedStep = oNextStep;

			if (this._oWizard.getCurrentStep() === "attachmentStep") {

				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(false);
				sap.ui.getCore().byId("claimSubmitBtn").setEnabled(true);
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);

			} else if (this._oWizard.getCurrentStep() === "personalDetailStep") {
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
			} else {
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
			}
		}, // Code for next button in the main claim wizard control.

		onDialogBackButton: function() {
			this._oWizard = sap.ui.getCore().byId("claimFormWizard");
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
			if (oEvent.getSource().getParent().getId() === "confidentialPopupDialog") {
				oEvent.getSource().getParent().close();
			} else if (this.WizardTitle === "StartClaim") {
				this.claimWizardDialog.close();
				this.InputFieldsClear();
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
				sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
				sap.ui.getCore().byId("claimFormWizard").setCurrentStep("personalDetailStep");
				this.WizardTitle = "InjuryTab";
			} else if (this.WizardTitle === "InjuryTab") {
				this.InjuryTabDialog.close();
				sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
				sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);

			} else if (this.WizardTitle === "PrivacyDialog") {
				this.PrivacyStatementDialog.close();
				this.WizardTitle = "InjuryTab";
			}

		}, // General method for closing the popup dialogs. 

		onInjuryTableRowSelect: function(oiEvent) {
			sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(true);
			var oInjuryDetailModel = new sap.ui.model.json.JSONModel();
			var path = oiEvent.getParameter('listItem').getBindingContext().getPath();
			var selectedRow = oiEvent.getSource().getModel().getProperty(path);
			this.getView().getModel("userDetailModel").getData().BodypartDes = selectedRow.BodypartDes;
			this.getView().getModel("userDetailModel").getData().InjDesc = selectedRow.InjurytypeDes;
			oInjuryDetailModel.setData(selectedRow);
			this.getView().setModel(oInjuryDetailModel, "oInjuryDetailModel");
			this.getView().getModel("userDetailModel").refresh();

		}, // To enable the the button in Injury table on click on row.

		onSelectMultipleDraftRecord: function(oEvent) {
			sap.ui.getCore().byId("contAsDraftBtn").setEnabled(true);
		},

		onChange: function(oEvent) {
			var oUploadCollection = oEvent.getSource();
			var oCustomerRequestToken = new UploadCollectionParameter({
				name: "x-requested-with",
				value: "X"
			});
			oUploadCollection.addHeaderParameter(oCustomerRequestToken);

			var oCustomerAcceptToken = new UploadCollectionParameter({
				name: "Accept",
				value: "application/json;odata=verbose"
			});
			oUploadCollection.addHeaderParameter(oCustomerAcceptToken);
		}, // Mandotory event to set the header parameter for upload collection.

		onUploadComplete: function(oEvent) {
			this.getView().getModel().refresh();
			var fileId = oEvent.mParameters.mParameters.headers.location;
			var docid = fileId.split("(")[1].replace(")", "");
			var oUploadCollection = sap.ui.getCore().byId("UploadCollection");
			if (oUploadCollection.getModel("AttachmentModel").getData().length === undefined) {
				var oData = [];
				this.attachmentsId[0] = [];
			} else {
				var oData = oUploadCollection.getModel("AttachmentModel").getData();
			}

			var url = this.getView().getModel().sServiceUrl + "/Files(" + docid + ")/$value";
			docid = docid.split("='")[1].replace("',Draftid", "");
			var that = this;
			oData.unshift({
				"ArcDocId": docid,
				"Filename": oEvent.getParameter("files")[0].fileName,
				"url": url
			});
			this.attachmentsId[0].push(docid);
			if (oUploadCollection.getModel("AttachmentModel").getData().length === undefined) {
				oUploadCollection.getModel("AttachmentModel").setData(oData);
			}
			oUploadCollection.getModel("AttachmentModel").refresh();
			var aItems = oUploadCollection.getItems();
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments(" + aItems.length + ")");
		}, // For file upload process.

		onBeforeUploadStarts: function(oEvent) {
			var oModel = this.getView().getModel();
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: encodeURIComponent(oEvent.getParameter("fileName"))
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			oModel.refreshSecurityToken();
			var oHeaders = oModel.oHeaders;
			var sToken = oHeaders['x-csrf-token'];
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: sToken
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderToken);

		}, //Madotory event for before file upload.

		deleteAttachmentListItems: function(oEvent) {
			var sItemToDeleteId = oEvent.getParameter("documentId");
			var oData = sap.ui.getCore().byId("UploadCollection").getModel("AttachmentModel").getData();
			if (oData.length > 0) {
				for (var i = 0; i < oData.length; i++) {
					if (oData[i].ArcDocId === sItemToDeleteId) {
						oData.splice(i, 1);
						sap.ui.getCore().byId("UploadCollection").getModel("AttachmentModel").refresh();
						break;
					}
				}
			}
			if (this.attachmentsId[0].length > 0) {
				for (var j = 0; j < this.attachmentsId[0].length; j++) {
					if (this.attachmentsId[0][j] === sItemToDeleteId) {
						this.attachmentsId[0].splice(j, 1);
						break;
					}
				}
			}
			sap.ui.getCore().byId("UploadCollection").getModel("AttachmentModel").setData(oData);
			var Items = sap.ui.getCore().byId("UploadCollection").getItems();
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments(" + Items.length + ")");
		}, // To delete the files from the attchment list.

		onPressSaveButton: function(oEvent) {
			this._oWizard = sap.ui.getCore().byId("claimFormWizard");
			var InputTitle = sap.ui.getCore().byId("InputTitle");
			var InputFamilyName = sap.ui.getCore().byId("InputFamilyName");
			var InputGivenName = sap.ui.getCore().byId("InputGivenName");
			var InputDob = sap.ui.getCore().byId("InputDob");
			var InputGender = sap.ui.getCore().byId("InputGender");
			var InputAddress = sap.ui.getCore().byId("InputAddress");
			var InputSuburb = sap.ui.getCore().byId("InputSuburb");
			var InputPersnlDetlState = sap.ui.getCore().byId("InputPersnlDetlState");
			var InputPostalAddress = sap.ui.getCore().byId("InputPostalAddress");
			var InputPostCode = sap.ui.getCore().byId("InputPostCode");
			var InputMaidenName = sap.ui.getCore().byId("InputMaidenName");
			var InputMobile = sap.ui.getCore().byId("InputMobile");
			var InputWork = sap.ui.getCore().byId("InputWork");
			var InputHome = sap.ui.getCore().byId("InputHome");
			var InputEmail = sap.ui.getCore().byId("InputEmail");
			var InputPersnlDetlQue1 = sap.ui.getCore().byId("InputPersnlDetlQue1");
			var InputPersnlDetlQue2 = sap.ui.getCore().byId("InputPersnlDetlQue2");
			var InputPersnlDetlQue3 = sap.ui.getCore().byId("InputPersnlDetlQue3");
			var InputInjuryBodyPart = sap.ui.getCore().byId("InputInjuryBodyPart");
			var InputHowWereYouInjured = sap.ui.getCore().byId("InputHowWereYouInjured");
			var InputWhatTaskWhenInjured = sap.ui.getCore().byId("InputWhatTaskWhenInjured");
			var InputAreaOfWorksite = sap.ui.getCore().byId("InputAreaOfWorksite");
			var InputAddressofIncident = sap.ui.getCore().byId("InputAddressofIncident");
			var InputInjurySuburb = sap.ui.getCore().byId("InputInjurySuburb");
			var InputInjuryState = sap.ui.getCore().byId("InputInjuryState");
			var InputInjuryPostcode = sap.ui.getCore().byId("InputInjuryPostcode");
			var InputInjuryDateTime = sap.ui.getCore().byId("InputInjuryDateTime");
			var InputWhenNoticeInjury = sap.ui.getCore().byId("InputWhenNoticeInjury");
			var InputStoppedWorkDateTIme = sap.ui.getCore().byId("InputStoppedWorkDateTIme");
			var InputInjuryReportDateTime = sap.ui.getCore().byId("InputInjuryReportDateTime");
			var InputEmployerResponsible = sap.ui.getCore().byId("InputEmployerResponsible");
			var InputActivityOnTimeOfInjury = sap.ui.getCore().byId("InputActivityOnTimeOfInjury");
			var InputInjuryPoliceStationReported = sap.ui.getCore().byId("InputInjuryPoliceStationReported");
			var InputRegNoOfVehicles = sap.ui.getCore().byId("InputRegNoOfVehicles");
			var InputVehicleState = sap.ui.getCore().byId("InputVehicleState");
			var InputInjuryQue1 = sap.ui.getCore().byId("InputInjuryQue1");
			var InputInjuryQue2 = sap.ui.getCore().byId("InputInjuryQue2");
			var InputInjuryQue3 = sap.ui.getCore().byId("InputInjuryQue3");
			var InputInjuryQue4 = sap.ui.getCore().byId("InputInjuryQue4");
			var InputInjuryQue5 = sap.ui.getCore().byId("InputInjuryQue5");
			var InputEmpNameOfOrg = sap.ui.getCore().byId("InputEmpNameOfOrg");
			var InputEmpStreetAdd = sap.ui.getCore().byId("InputEmpStreetAdd");
			var InputEmpOrgState = sap.ui.getCore().byId("InputEmpOrgState");
			var InputEmpOrgSuburb = sap.ui.getCore().byId("InputEmpOrgSuburb");
			var InputEmpOrgPostcode = sap.ui.getCore().byId("InputEmpOrgPostcode");
			var InputEmpNameAndContact = sap.ui.getCore().byId("InputEmpNameAndContact");
			var InputEmpOccupation = sap.ui.getCore().byId("InputEmpOccupation");
			var InputEmpStartWorkingDate = sap.ui.getCore().byId("InputEmpStartWorkingDate");
			var InputEmpDirectorofMyEmployersComp = sap.ui.getCore().byId("InputEmpDirectorofMyEmployersComp");
			var InputEmpPartnerinMyEmployersComp = sap.ui.getCore().byId("InputEmpPartnerinMyEmployersComp");
			var InputEmpSoleTrader = sap.ui.getCore().byId("InputEmpSoleTrader");
			var InputEmpRelativeofMyEmployer = sap.ui.getCore().byId("InputEmpRelativeofMyEmployer");
			var InputEmpOtherEmployment = sap.ui.getCore().byId("InputEmpOtherEmployment");
			var InputEmpAppliesToYou = sap.ui.getCore().byId("InputEmpAppliesToYou");
			var InputWorkerQue1 = sap.ui.getCore().byId("InputWorkerQue1");
			var InputWorkerQue2 = sap.ui.getCore().byId("InputWorkerQue2");
			var InputWorkerQue3 = sap.ui.getCore().byId("InputWorkerQue3");
			var InputWorkerQue4 = sap.ui.getCore().byId("InputWorkerQue4");
			var InputWorkerWeeklyShiftAllowence = sap.ui.getCore().byId("InputWorkerWeeklyShiftAllowence");
			var InputWorkerWeeklyOvertime = sap.ui.getCore().byId("InputWorkerWeeklyOvertime");
			var InputReturToWorkQue1 = sap.ui.getCore().byId("InputReturToWorkQue1");
			var InputReturToWorkDate = sap.ui.getCore().byId("InputReturToWorkDate");
			var InputReturToWorkOue2 = sap.ui.getCore().byId("InputReturToWorkOue2");
			var InputReturToWorkOue3 = sap.ui.getCore().byId("InputReturToWorkOue3");
			var InputReturToWorkOue4 = sap.ui.getCore().byId("InputReturToWorkOue4");
			var InputReturToWorkClaimFormSubmissionDate = sap.ui.getCore().byId("InputReturToWorkClaimFormSubmissionDate");
			var InputReturToWorkOue5 = sap.ui.getCore().byId("InputReturToWorkOue5");
			var InputReturToWorkMedicalCertificateSubmissionDate = sap.ui.getCore().byId("InputReturToWorkMedicalCertificateSubmissionDate");
			var InputDeclarationDate = sap.ui.getCore().byId("InputDeclarationDate");
			var InputInjuryType = sap.ui.getCore().byId("InputInjuryType");
			var canvas = document.getElementById("signature-pad");
			this.signString = btoa(encodeURI(canvas.toDataURL('image/jpeg').replace("data:image/jpeg:base64,", "")));
			if (this.roughString === this.signString) {
				this.signString = "";
			}
			if (InputInjuryDateTime.getValue() !== "" || InputInjuryDateTime.getDateValue() !== null) {
				var finDate = new Date(InputInjuryDateTime.getDateValue()).toISOString();
			}
			if (InputWhenNoticeInjury.getValue() !== "" || InputWhenNoticeInjury.getDateValue() !== null) {
				var crDate = new Date(InputWhenNoticeInjury.getDateValue()).toISOString();
			}
			if (InputStoppedWorkDateTIme.getValue() !== "" || InputStoppedWorkDateTIme.getDateValue() !== null) {
				var sDate = new Date(InputStoppedWorkDateTIme.getDateValue()).toISOString();
			}
			if (InputInjuryReportDateTime.getValue() !== "" || InputInjuryReportDateTime.getDateValue() !== null) {
				var rDate = new Date(InputInjuryReportDateTime.getDateValue()).toISOString();
			}
			if (InputDeclarationDate.getValue() !== "" || InputDeclarationDate.getDateValue() !== null) {
				var dDate = new Date(InputDeclarationDate.getDateValue()).toISOString();
			}
			if (InputEmpStartWorkingDate.getDateValue() !== undefined || InputEmpStartWorkingDate.getDateValue() !== null) {
				var startDate = new Date(InputEmpStartWorkingDate.getDateValue()).toISOString();
			}
			if (InputReturToWorkDate.getValue() !== "" || InputReturToWorkDate.getDateValue() !== null) {
				var returnToWorkDate = new Date(InputReturToWorkDate.getDateValue()).toISOString();
			}
			if (InputReturToWorkClaimFormSubmissionDate.getValue() !== "" || InputReturToWorkClaimFormSubmissionDate.getDateValue() !==
				null) {
				var EmpClmfrmDate = new Date(InputReturToWorkClaimFormSubmissionDate.getDateValue()).toISOString();
			}
			if (InputReturToWorkMedicalCertificateSubmissionDate.getValue() !== "" ||
				InputReturToWorkMedicalCertificateSubmissionDate.getDateValue() !== null) {
				var EmpMcertDate = new Date(InputReturToWorkMedicalCertificateSubmissionDate.getDateValue()).toISOString();
			}
			if (oEvent.getSource().getId() === "claimDraftBtn") {

				if (this._oWizard.getCurrentStep() === "personalDetailStep") {
					var tabNo = "1";
				} else if (this._oWizard.getCurrentStep() === "injuryDetailStep") {
					var tabNo = "2";
				} else if (this._oWizard.getCurrentStep() === "employmentDetailStep") {
					var tabNo = "3";
				} else if (this._oWizard.getCurrentStep() === "workerEarningStep") {
					var tabNo = "4";
				} else if (this._oWizard.getCurrentStep() === "returntoWorkStep") {
					var tabNo = "5";
				} else if (this._oWizard.getCurrentStep() === "workerDecStep") {
					var tabNo = "6";
				} else if (this._oWizard.getCurrentStep() === "attachmentStep") {
					var tabNo = "7";
				}
				if (this.getView().getModel("oInjuryDetailModel")) {

					var payload = {
						"Confidential": !this.ConfidentialColumnText ? false : true,
						"Draft": true,
						"TabNo": tabNo,
						"Pernr": this.getView().getModel("userDetailModel").getData().Pernr,
						"Userid": this.userName,
						"RegulatoryAuth": "VIC",
						"Title": InputTitle.getValue(),
						"FamilyName": InputFamilyName.getValue(),
						"Conname": InputGivenName.getValue(),
						"Dateofbirth": InputDob.getValue(),
						"Gender": InputGender.getValue(),
						"Add1": InputAddress.getValue(),
						"Suburb": InputSuburb.getValue(),
						"StateId": InputPersnlDetlState.getSelectedKey(),
						"PostalAddress": InputPostalAddress.getValue(),
						"Pstlz": InputPostCode.getValue(),
						"Othnam": InputMaidenName.getValue(),
						"Mobile": InputMobile.getValue(),
						"WorkN": InputWork.getValue(),
						"Home": InputHome.getValue(),
						"Email": InputEmail.getValue(),
						"Agree": InputPersnlDetlQue1.getSelectedKey(),
						"Language": InputPersnlDetlQue2.getValue(),
						"Communication": InputPersnlDetlQue3.getValue(),
						"BodypartDes": InputInjuryBodyPart.getValue(),
						"Bodypart": this.getView().getModel("oInjuryDetailModel").getData().Bodypart,
						"Casno": this.getView().getModel("oInjuryDetailModel").getData().InjuryNumber,
						"Maininjury": this.getView().getModel("oInjuryDetailModel").getData().Maininjury,
						"Injurytypevcode": this.getView().getModel("oInjuryDetailModel").getData().Injurytypevcode,
						"Side": this.getView().getModel("oInjuryDetailModel").getData().Side,
						"Injurytype": this.getView().getModel("oInjuryDetailModel").getData().Injurytype,
						"InjHapDes": InputHowWereYouInjured.getValue(),
						"InjDoingDes": InputWhatTaskWhenInjured.getValue(),
						"InjWorkSide": InputAreaOfWorksite.getValue(),
						"AddressInj": InputAddressofIncident.getValue(),
						"SuburbInj": InputInjurySuburb.getValue(),
						"State": InputInjuryState.getSelectedKey(),
						"PostcodeInj": InputInjuryPostcode.getValue(),
						"IDate": !finDate ? "" : finDate,
						"Crdate": !crDate ? "" : crDate,
						"Sdate": !sDate ? "" : sDate,
						"Rdate": !rDate ? "" : rDate,
						"ManagerPernr": !this.ManagerPernr ? "" : this.ManagerPernr,
						"Name1": InputEmployerResponsible.getValue(),
						"Activitywheninjureddesc": InputActivityOnTimeOfInjury.getSelectedKey(),
						"InjPsName": InputInjuryPoliceStationReported.getValue(),
						"InjRegNo": InputRegNoOfVehicles.getValue(),
						"InjState": InputVehicleState.getSelectedKey(),
						"InjCondMs": InputInjuryQue1.getValue(),
						"InjNamePersonR": InputInjuryQue2.getValue(),
						"InjNrepoDelay": InputInjuryQue3.getValue(),
						"InjWitDet": InputInjuryQue4.getValue(),
						"InjPrev": InputInjuryQue5.getValue(),
						"Orgname": InputEmpNameOfOrg.getValue(),
						"EmpStreetAdd": InputEmpStreetAdd.getValue(),
						"Employerstate": InputEmpOrgState.getSelectedKey(),
						"EmpSuburb": InputEmpOrgSuburb.getValue(),
						"EmpPostcode": InputEmpOrgPostcode.getValue(),
						"Employercontact": InputEmpNameAndContact.getValue(),
						"Usualoccupation": InputEmpOccupation.getValue(),
						"Startdate": !startDate ? "" : startDate,
						"Directorcheck": InputEmpDirectorofMyEmployersComp.getSelectedKey(),
						"Partnercheck": InputEmpPartnerinMyEmployersComp.getSelectedKey(),
						"Soletradercheck": InputEmpSoleTrader.getSelectedKey(),
						"Relativecheck": InputEmpRelativeofMyEmployer.getSelectedKey(),
						"OtherEmployement": InputEmpOtherEmployment.getValue(),
						"Reasontoapply": InputEmpAppliesToYou.getSelectedKey(),
						"WpeStdHrsWeek": InputWorkerQue1.getValue(),
						"WpeUsuWeeklyHrs": InputWorkerQue2.getValue(),
						"WpePreTaxHrRt": InputWorkerQue3.getValue(),
						"WpePtaxWkEr": InputWorkerQue4.getValue(),
						"WpeWklyAllw": InputWorkerWeeklyShiftAllowence.getValue(),
						"WpeWostd": InputWorkerWeeklyOvertime.getValue(),
						"RtwDetails": InputReturToWorkQue1.getValue(),
						"RtwEmpDate": !returnToWorkDate ? "" : returnToWorkDate,
						"Duties": InputReturToWorkOue2.getSelectedKey(),
						"RtwNempDetails": InputReturToWorkOue3.getValue(),
						"NrtwIdp": InputReturToWorkOue4.getValue(),
						"EmpClmfrmDate": !EmpClmfrmDate ? "" : EmpClmfrmDate,
						"EmpClmForm": InputReturToWorkOue5.getSelectedKey(),
						"EmpMcertDate": !EmpMcertDate ? "" : EmpMcertDate,
						"DDate": !dDate ? "" : dDate,
						"Signature": this.signString,
						"Attachments": this.attachmentsId.toString(),
						"Draftid": this.DraftId,
						"InjDesc": InputInjuryType.getValue()
					};
				} else {
					var payload = {
						"Confidential": !this.ConfidentialColumnText ? false : true,
						"Draft": true,
						"TabNo": tabNo,
						"Pernr": this.getView().getModel("userDetailModel").getData().Pernr,
						"Userid": this.userName,
						"RegulatoryAuth": "VIC",
						"Title": InputTitle.getValue(),
						"FamilyName": InputFamilyName.getValue(),
						"Conname": InputGivenName.getValue(),
						"Dateofbirth": InputDob.getValue(),
						"Gender": InputGender.getValue(),
						"Add1": InputAddress.getValue(),
						"Suburb": InputSuburb.getValue(),
						"StateId": InputPersnlDetlState.getSelectedKey(),
						"PostalAddress": InputPostalAddress.getValue(),
						"Pstlz": InputPostCode.getValue(),
						"Othnam": InputMaidenName.getValue(),
						"Mobile": InputMobile.getValue(),
						"WorkN": InputWork.getValue(),
						"Home": InputHome.getValue(),
						"Email": InputEmail.getValue(),
						"Agree": InputPersnlDetlQue1.getSelectedKey(),
						"Language": InputPersnlDetlQue2.getValue(),
						"Communication": InputPersnlDetlQue3.getValue(),
						"BodypartDes": InputInjuryBodyPart.getValue(),
						"Bodypart": this.getView().getModel("userDetailModel").getData().Bodypart,
						"Casno": this.getView().getModel("userDetailModel").getData().InjuryNumber,
						"Maininjury": this.getView().getModel("userDetailModel").getData().Maininjury,
						"Injurytypevcode": this.getView().getModel("userDetailModel").getData().Injurytypevcode,
						"Side": this.getView().getModel("userDetailModel").getData().Side,
						"Injurytype": this.getView().getModel("userDetailModel").getData().Injurytype,
						"InjHapDes": InputHowWereYouInjured.getValue(),
						"InjDoingDes": InputWhatTaskWhenInjured.getValue(),
						"InjWorkSide": InputAreaOfWorksite.getValue(),
						"AddressInj": InputAddressofIncident.getValue(),
						"SuburbInj": InputInjurySuburb.getValue(),
						"State": InputInjuryState.getSelectedKey(),
						"PostcodeInj": InputInjuryPostcode.getValue(),
						"IDate": !finDate ? "" : finDate,
						"Crdate": !crDate ? "" : crDate,
						"Sdate": !sDate ? "" : sDate,
						"Rdate": !rDate ? "" : rDate,
						"ManagerPernr": !this.ManagerPernr ? "" : this.ManagerPernr,
						"Name1": InputEmployerResponsible.getValue(),
						"Activitywheninjureddesc": InputActivityOnTimeOfInjury.getSelectedKey(),
						"InjPsName": InputInjuryPoliceStationReported.getValue(),
						"InjRegNo": InputRegNoOfVehicles.getValue(),
						"InjState": InputVehicleState.getSelectedKey(),
						"InjCondMs": InputInjuryQue1.getValue(),
						"InjNamePersonR": InputInjuryQue2.getValue(),
						"InjNrepoDelay": InputInjuryQue3.getValue(),
						"InjWitDet": InputInjuryQue4.getValue(),
						"InjPrev": InputInjuryQue5.getValue(),
						"Orgname": InputEmpNameOfOrg.getValue(),
						"EmpStreetAdd": InputEmpStreetAdd.getValue(),
						"Employerstate": InputEmpOrgState.getSelectedKey(),
						"EmpSuburb": InputEmpOrgSuburb.getValue(),
						"EmpPostcode": InputEmpOrgPostcode.getValue(),
						"Employercontact": InputEmpNameAndContact.getValue(),
						"Usualoccupation": InputEmpOccupation.getValue(),
						"Startdate": !startDate ? "" : startDate,
						"Directorcheck": InputEmpDirectorofMyEmployersComp.getSelectedKey(),
						"Partnercheck": InputEmpPartnerinMyEmployersComp.getSelectedKey(),
						"Soletradercheck": InputEmpSoleTrader.getSelectedKey(),
						"Relativecheck": InputEmpRelativeofMyEmployer.getSelectedKey(),
						"OtherEmployement": InputEmpOtherEmployment.getValue(),
						"Reasontoapply": InputEmpAppliesToYou.getSelectedKey(),
						"WpeStdHrsWeek": InputWorkerQue1.getValue(),
						"WpeUsuWeeklyHrs": InputWorkerQue2.getValue(),
						"WpePreTaxHrRt": InputWorkerQue3.getValue(),
						"WpePtaxWkEr": InputWorkerQue4.getValue(),
						"WpeWklyAllw": InputWorkerWeeklyShiftAllowence.getValue(),
						"WpeWostd": InputWorkerWeeklyOvertime.getValue(),
						"RtwDetails": InputReturToWorkQue1.getValue(),
						"RtwEmpDate": !returnToWorkDate ? "" : returnToWorkDate,
						"Duties": InputReturToWorkOue2.getSelectedKey(),
						"RtwNempDetails": InputReturToWorkOue3.getValue(),
						"NrtwIdp": InputReturToWorkOue4.getValue(),
						"EmpClmfrmDate": !EmpClmfrmDate ? "" : EmpClmfrmDate,
						"EmpClmForm": InputReturToWorkOue5.getSelectedKey(),
						"EmpMcertDate": !EmpMcertDate ? "" : EmpMcertDate,
						"DDate": !dDate ? "" : dDate,
						"Signature": this.signString,
						"Attachments": this.attachmentsId.toString(),
						"Draftid": this.DraftId
					};
				}

				var that = this;
				this.getView().getModel().setUseBatch(false);
				this.getView().getModel().create("/SaveDraftDetailsSet", payload, {
					success: function(oData, oResponse) {
						that.claimWizardDialog.close();
						sap.m.MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("DraftSavedsuccessfully"));
						that.InputFieldsClear();

					},
					error: function(error) {

						that.claimWizardDialog.close();
					}
				});

			} else if (oEvent.getSource().getId() === "claimSubmitBtn") {
				if (!this.oApproveDialog) {
					this.oApproveDialog = new sap.m.Dialog({
						type: sap.m.DialogType.Message,
						title: this.getView().getModel("i18n").getResourceBundle().getText("Confirm"),
						content: new sap.m.Text({
							text: this.getView().getModel("i18n").getResourceBundle().getText("comfirmationMessage")
						}),
						beginButton: new sap.m.Button({
							type: sap.m.ButtonType.Emphasized,
							text: this.getView().getModel("i18n").getResourceBundle().getText("Submit"),
							press: function() {
								if (this.getView().getModel("oInjuryDetailModel")) {
									var payload = {
										"Confidential": !this.ConfidentialColumnText ? false : true,
										"Draft": false,
										"TabNo": tabNo,
										"Pernr": this.getView().getModel("userDetailModel").getData().Pernr,
										"Userid": this.userName,
										"RegulatoryAuth": "VIC",
										"Title": InputTitle.getValue(),
										"FamilyName": InputFamilyName.getValue(),
										"Conname": InputGivenName.getValue(),
										"Dateofbirth": InputDob.getValue(),
										"Gender": InputGender.getValue(),
										"Add1": InputAddress.getValue(),
										"Suburb": InputSuburb.getValue(),
										"StateId": InputPersnlDetlState.getSelectedKey(),
										"PostalAddress": InputPostalAddress.getValue(),
										"Pstlz": InputPostCode.getValue(),
										"Othnam": InputMaidenName.getValue(),
										"Mobile": InputMobile.getValue(),
										"WorkN": InputWork.getValue(),
										"Home": InputHome.getValue(),
										"Email": InputEmail.getValue(),
										"Agree": InputPersnlDetlQue1.getSelectedKey(),
										"Language": InputPersnlDetlQue2.getValue(),
										"Communication": InputPersnlDetlQue3.getValue(),
										"BodypartDes": InputInjuryBodyPart.getValue(),
										"Bodypart": this.getView().getModel("oInjuryDetailModel").getData().Bodypart,
										"Casno": this.getView().getModel("oInjuryDetailModel").getData().InjuryNumber,
										"Maininjury": this.getView().getModel("oInjuryDetailModel").getData().Maininjury,
										"Injurytypevcode": this.getView().getModel("oInjuryDetailModel").getData().Injurytypevcode,
										"Side": this.getView().getModel("oInjuryDetailModel").getData().Side,
										"Injurytype": this.getView().getModel("oInjuryDetailModel").getData().Injurytype,
										"InjHapDes": InputHowWereYouInjured.getValue(),
										"InjDoingDes": InputWhatTaskWhenInjured.getValue(),
										"InjWorkSide": InputAreaOfWorksite.getValue(),
										"AddressInj": InputAddressofIncident.getValue(),
										"SuburbInj": InputInjurySuburb.getValue(),
										"State": InputInjuryState.getSelectedKey(),
										"PostcodeInj": InputInjuryPostcode.getValue(),
										"IDate": !finDate ? "" : finDate,
										"Crdate": !crDate ? "" : crDate,
										"Sdate": !sDate ? "" : sDate,
										"Rdate": !rDate ? "" : rDate,
										"ManagerPernr": !this.ManagerPernr ? "" : this.ManagerPernr,
										"Name1": InputEmployerResponsible.getValue(),
										"Activitywheninjureddesc": InputActivityOnTimeOfInjury.getSelectedKey(),
										"InjPsName": InputInjuryPoliceStationReported.getValue(),
										"InjRegNo": InputRegNoOfVehicles.getValue(),
										"InjState": InputVehicleState.getSelectedKey(),
										"InjCondMs": InputInjuryQue1.getValue(),
										"InjNamePersonR": InputInjuryQue2.getValue(),
										"InjNrepoDelay": InputInjuryQue3.getValue(),
										"InjWitDet": InputInjuryQue4.getValue(),
										"InjPrev": InputInjuryQue5.getValue(),
										"Orgname": InputEmpNameOfOrg.getValue(),
										"EmpStreetAdd": InputEmpStreetAdd.getValue(),
										"Employerstate": InputEmpOrgState.getSelectedKey(),
										"EmpSuburb": InputEmpOrgSuburb.getValue(),
										"EmpPostcode": InputEmpOrgPostcode.getValue(),
										"Employercontact": InputEmpNameAndContact.getValue(),
										"Usualoccupation": InputEmpOccupation.getValue(),
										"Startdate": !startDate ? "" : startDate,
										"Directorcheck": InputEmpDirectorofMyEmployersComp.getSelectedKey(),
										"Partnercheck": InputEmpPartnerinMyEmployersComp.getSelectedKey(),
										"Soletradercheck": InputEmpSoleTrader.getSelectedKey(),
										"Relativecheck": InputEmpRelativeofMyEmployer.getSelectedKey(),
										"OtherEmployement": InputEmpOtherEmployment.getValue(),
										"Reasontoapply": InputEmpAppliesToYou.getSelectedKey(),
										"WpeStdHrsWeek": InputWorkerQue1.getValue(),
										"WpeUsuWeeklyHrs": InputWorkerQue2.getValue(),
										"WpePreTaxHrRt": InputWorkerQue3.getValue(),
										"WpePtaxWkEr": InputWorkerQue4.getValue(),
										"WpeWklyAllw": InputWorkerWeeklyShiftAllowence.getValue(),
										"WpeWostd": InputWorkerWeeklyOvertime.getValue(),
										"RtwDetails": InputReturToWorkQue1.getValue(),
										"RtwEmpDate": !returnToWorkDate ? "" : returnToWorkDate,
										"Duties": InputReturToWorkOue2.getSelectedKey(),
										"RtwNempDetails": InputReturToWorkOue3.getValue(),
										"NrtwIdp": InputReturToWorkOue4.getValue(),
										"EmpClmfrmDate": !EmpClmfrmDate ? "" : EmpClmfrmDate,
										"EmpClmForm": InputReturToWorkOue5.getSelectedKey(),
										"EmpMcertDate": !EmpMcertDate ? "" : EmpMcertDate,
										"DDate": !dDate ? "" : dDate,
										"Signature": this.signString,
										"Attachments": this.attachmentsId.toString(),
										"Draftid": this.DraftId
									};
								} else {
									var payload = {
										"Confidential": !this.ConfidentialColumnText ? false : true,
										"Draft": false,
										"TabNo": tabNo,
										"Pernr": this.getView().getModel("userDetailModel").getData().Pernr,
										"Userid": this.userName,
										"RegulatoryAuth": "VIC",
										"Title": InputTitle.getValue(),
										"FamilyName": InputFamilyName.getValue(),
										"Conname": InputGivenName.getValue(),
										"Dateofbirth": InputDob.getValue(),
										"Gender": InputGender.getValue(),
										"Add1": InputAddress.getValue(),
										"Suburb": InputSuburb.getValue(),
										"StateId": InputPersnlDetlState.getSelectedKey(),
										"PostalAddress": InputPostalAddress.getValue(),
										"Pstlz": InputPostCode.getValue(),
										"Othnam": InputMaidenName.getValue(),
										"Mobile": InputMobile.getValue(),
										"WorkN": InputWork.getValue(),
										"Home": InputHome.getValue(),
										"Email": InputEmail.getValue(),
										"Agree": InputPersnlDetlQue1.getSelectedKey(),
										"Language": InputPersnlDetlQue2.getValue(),
										"Communication": InputPersnlDetlQue3.getValue(),
										"BodypartDes": InputInjuryBodyPart.getValue(),
										"Bodypart": this.getView().getModel("userDetailModel").getData().Bodypart,
										"Casno": this.getView().getModel("userDetailModel").getData().InjuryNumber,
										"Maininjury": this.getView().getModel("userDetailModel").getData().Maininjury,
										"Injurytypevcode": this.getView().getModel("userDetailModel").getData().Injurytypevcode,
										"Side": this.getView().getModel("userDetailModel").getData().Side,
										"Injurytype": this.getView().getModel("userDetailModel").getData().Injurytype,
										"InjHapDes": InputHowWereYouInjured.getValue(),
										"InjDoingDes": InputWhatTaskWhenInjured.getValue(),
										"InjWorkSide": InputAreaOfWorksite.getValue(),
										"AddressInj": InputAddressofIncident.getValue(),
										"SuburbInj": InputInjurySuburb.getValue(),
										"State": InputInjuryState.getSelectedKey(),
										"PostcodeInj": InputInjuryPostcode.getValue(),
										"IDate": !finDate ? "" : finDate,
										"Crdate": !crDate ? "" : crDate,
										"Sdate": !sDate ? "" : sDate,
										"Rdate": !rDate ? "" : rDate,
										"ManagerPernr": !this.ManagerPernr ? "" : this.ManagerPernr,
										"Name1": InputEmployerResponsible.getValue(),
										"Activitywheninjureddesc": InputActivityOnTimeOfInjury.getSelectedKey(),
										"InjPsName": InputInjuryPoliceStationReported.getValue(),
										"InjRegNo": InputRegNoOfVehicles.getValue(),
										"InjState": InputVehicleState.getSelectedKey(),
										"InjCondMs": InputInjuryQue1.getValue(),
										"InjNamePersonR": InputInjuryQue2.getValue(),
										"InjNrepoDelay": InputInjuryQue3.getValue(),
										"InjWitDet": InputInjuryQue4.getValue(),
										"InjPrev": InputInjuryQue5.getValue(),
										"Orgname": InputEmpNameOfOrg.getValue(),
										"EmpStreetAdd": InputEmpStreetAdd.getValue(),
										"Employerstate": InputEmpOrgState.getSelectedKey(),
										"EmpSuburb": InputEmpOrgSuburb.getValue(),
										"EmpPostcode": InputEmpOrgPostcode.getValue(),
										"Employercontact": InputEmpNameAndContact.getValue(),
										"Usualoccupation": InputEmpOccupation.getValue(),
										"Startdate": !startDate ? "" : startDate,
										"Directorcheck": InputEmpDirectorofMyEmployersComp.getSelectedKey(),
										"Partnercheck": InputEmpPartnerinMyEmployersComp.getSelectedKey(),
										"Soletradercheck": InputEmpSoleTrader.getSelectedKey(),
										"Relativecheck": InputEmpRelativeofMyEmployer.getSelectedKey(),
										"OtherEmployement": InputEmpOtherEmployment.getValue(),
										"Reasontoapply": InputEmpAppliesToYou.getSelectedKey(),
										"WpeStdHrsWeek": InputWorkerQue1.getValue(),
										"WpeUsuWeeklyHrs": InputWorkerQue2.getValue(),
										"WpePreTaxHrRt": InputWorkerQue3.getValue(),
										"WpePtaxWkEr": InputWorkerQue4.getValue(),
										"WpeWklyAllw": InputWorkerWeeklyShiftAllowence.getValue(),
										"WpeWostd": InputWorkerWeeklyOvertime.getValue(),
										"RtwDetails": InputReturToWorkQue1.getValue(),
										"RtwEmpDate": returnToWorkDate,
										"Duties": InputReturToWorkOue2.getSelectedKey(),
										"RtwNempDetails": InputReturToWorkOue3.getValue(),
										"NrtwIdp": InputReturToWorkOue4.getValue(),
										"EmpClmfrmDate": !EmpClmfrmDate ? "" : EmpClmfrmDate,
										"EmpClmForm": InputReturToWorkOue5.getSelectedKey(),
										"EmpMcertDate": !EmpMcertDate ? "" : EmpMcertDate,
										"DDate": !dDate ? "" : dDate,
										"Signature": this.signString,
										"Attachments": this.attachmentsId.toString(),
										"Draftid": this.DraftId
									};
								}

								this.oApproveDialog.close();
								var that = this;
								this.getView().getModel().create("/SaveDraftDetailsSet", payload, {
									success: function(oData, oResponse) {
										that.InputFieldsClear();
										if (oData.Casno === undefined) {
											oData.Casno = "";
										}
										sap.m.MessageBox.success(
											oData.Casno + " " + that.getView().getModel("i18n").getResourceBundle().getText("ClaimSuccessMessage"), {
												actions: [that.getView().getModel("i18n").getResourceBundle().getText("ok")],
												onClose: function(sAction) {
													var sSource = that.getView().getModel().sServiceUrl + "/InjuryFormSet(Casno='" + oData.Casno + "',Userid='" +
														that.userName + "')/$value";
													that.claimWizardDialog.close();
													sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
													sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
													that._oWizard.setCurrentStep("personalDetailStep");
													that._pdfViewer = new sap.m.PDFViewer();
													that.getView().addDependent(that._pdfViewer);
													that._pdfViewer.setSource(sSource);
													that._pdfViewer.setTitle(that.getView().getModel("i18n").getResourceBundle().getText("SamrtFormTitle"));
													that._pdfViewer.open();
												}
											}
										);
									},
									error: function(error) {

									}
								});

							}.bind(this)
						}),
						endButton: new sap.m.Button({
							text: this.getView().getModel("i18n").getResourceBundle().getText("WizardFooterCancelBtn"),
							press: function() {
								this.oApproveDialog.close();
							}.bind(this)
						})
					});
				}

				this.oApproveDialog.open();

			}

		}, // Submit and save as draft button functionality

		onSign: function() {
			var canvas = document.getElementById("signature-pad");
			var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				backgroundColor: '#FFFFFF'
			})
			var context = canvas.getContext("2d");
			canvas.width = 200;
			canvas.height = 200;
			context.fillStyle = "#fff";
			context.strokeStyle = "#444";
			context.lineWidth = 3.5;
			context.lineCap = "round";
			context.fillRect(0, 0, canvas.width, canvas.height);
			var disableSave = true;
			var pixels = [];
			var cpixels = [];
			var xyLast = {};
			var xyAddLast = {};
			var calculate = false; { //functions
				function remove_event_listeners() {
					canvas.removeEventListener('mousemove', on_mousemove, false);
					canvas.removeEventListener('mouseup', on_mouseup, false);
					canvas.removeEventListener('touchmove', on_mousemove, false);
					canvas.removeEventListener('touchend', on_mouseup, false);

					document.body.removeEventListener('mouseup', on_mouseup, false);
					document.body.removeEventListener('touchend', on_mouseup, false);
				}

				function get_coords(e) {
					var x, y;

					if (e.changedTouches && e.changedTouches[0]) {
						var canvasArea = canvas.getBoundingClientRect();
						var offsety = canvasArea.top || 0;
						var offsetx = canvasArea.left || 0;

						x = e.changedTouches[0].pageX - offsetx;
						y = e.changedTouches[0].pageY - offsety;
					} else if (e.layerX || 0 == e.layerX) {
						x = e.layerX;
						y = e.layerY;
					} else if (e.offsetX || 0 == e.offsetX) {
						x = e.offsetX;
						y = e.offsetY;
					}

					return {
						x: x,
						y: y
					};
				};

				function on_mousedown(e) {
					e.preventDefault();
					e.stopPropagation();

					canvas.addEventListener('mouseup', on_mouseup, false);
					canvas.addEventListener('mousemove', on_mousemove, false);
					canvas.addEventListener('touchend', on_mouseup, false);
					canvas.addEventListener('touchmove', on_mousemove, false);
					document.body.addEventListener('mouseup', on_mouseup, false);
					document.body.addEventListener('touchend', on_mouseup, false);

					var empty = false;
					var xy = get_coords(e);
					context.beginPath();
					pixels.push('moveStart');
					context.moveTo(xy.x, xy.y);
					pixels.push(xy.x, xy.y);
					xyLast = xy;
				};

				function on_mousemove(e, finish) {
					e.preventDefault();
					e.stopPropagation();

					var xy = get_coords(e);
					var xyAdd = {
						x: (xyLast.x + xy.x) / 2,
						y: (xyLast.y + xy.y) / 2
					};

					if (calculate) {
						var xLast = (xyAddLast.x + xyLast.x + xyAdd.x) / 3;
						var yLast = (xyAddLast.y + xyLast.y + xyAdd.y) / 3;
						pixels.push(xLast, yLast);
					} else {
						calculate = true;
					}

					context.quadraticCurveTo(xyLast.x, xyLast.y, xyAdd.x, xyAdd.y);
					pixels.push(xyAdd.x, xyAdd.y);
					context.stroke();
					context.beginPath();
					context.moveTo(xyAdd.x, xyAdd.y);
					xyAddLast = xyAdd;
					xyLast = xy;

				};

				function on_mouseup(e) {
					remove_event_listeners();
					disableSave = false;
					context.stroke();
					pixels.push('e');
					calculate = false;
				};
				canvas.addEventListener('touchstart', on_mousedown, false);
				canvas.addEventListener('mousedown', on_mousedown, false);
			}

		},

		clearButton: function(oEvent) {
			var canvas = document.getElementById("signature-pad");
			var context = canvas.getContext("2d");
			context.clearRect(0, 0, canvas.width, canvas.height);
			this.onSign();
		},

		onOpenHelpPopup: function(oEvent) {
			if (!this.helpPopup) {
				this.helpPopup = sap.ui.xmlfragment("safetysuitezclaimemployee.fragment.HelpPopup", this);
				this.getView().addDependent(this.helpPopup);
			}
			this.helpPopup.openBy(oEvent.getSource());
		},

		checkInputValidation: function(oEvent) {
			if (oEvent.getParameters().value !== "" || oEvent.getParameters().value !== undefined) {
				oEvent.getSource().setValueState("None");
			} else {
				oEvent.getSource().setValueState("Error");
			}
			if (oEvent.getSource().getId() === "ManagerList") {
				this.ManagerPernr = oEvent.getSource().getSelectedKey();
			}

		}, // Validation for mandatory fields it empty

		onChangeCheckLength: function(oEvent) {
			if (oEvent.getSource().getId() === "InputPostCode" || oEvent.getSource().getId() === "InputInjuryPostcode" || oEvent.getSource().getId() ===
				"InputEmpOrgPostcode") {
				if (oEvent.getSource().getValue().length > 4) {
					oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, -1));
				}
			} else if (oEvent.getSource().getId() === "InputMobile" || oEvent.getSource().getId() === "InputWork" || oEvent.getSource().getId() ===
				"InputHome") {
				if (oEvent.getSource().getValue().length > 10) {
					oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, -1));
				}
			} else if (oEvent.getSource().getId() === "InputWorkerQue1" || oEvent.getSource().getId() === "InputWorkerQue3" || oEvent.getSource()
				.getId() === "InputWorkerQue4" || oEvent.getSource().getId() === "InputWorkerWeeklyShiftAllowence" || oEvent.getSource().getId() ===
				"InputWorkerWeeklyOvertime") {
				if (oEvent.getSource().getValue().length > 3) {
					oEvent.getSource().setValue(oEvent.getSource().getValue().slice(0, -1));
				}
			}
		}, // Validation for maxLength for type=number input fields

		InputFieldsClear: function() {
			/*	sap.ui.getCore().byId("InputFamilyName").setValue("");
				sap.ui.getCore().byId("InputGivenName").setValue("");
				sap.ui.getCore().byId("InputDob").setValue("");
				sap.ui.getCore().byId("InputGender").setValue("");*/
			sap.ui.getCore().byId("InputAddress").setValue("");
			sap.ui.getCore().byId("InputSuburb").setValue("");
			sap.ui.getCore().byId("InputPersnlDetlState").setSelectedKey("");
			sap.ui.getCore().byId("InputPostalAddress").setValue("");
			sap.ui.getCore().byId("InputPostCode").setValue("");
			sap.ui.getCore().byId("InputMaidenName").setValue("");
			sap.ui.getCore().byId("InputMobile").setValue("");
			sap.ui.getCore().byId("InputWork").setValue("");
			sap.ui.getCore().byId("InputHome").setValue("");
			sap.ui.getCore().byId("InputEmail").setValue("");
			sap.ui.getCore().byId("InputPersnlDetlQue2").setValue("");
			sap.ui.getCore().byId("InputPersnlDetlQue3").setValue("");
			sap.ui.getCore().byId("InputInjuryBodyPart").setValue("");
			sap.ui.getCore().byId("InputHowWereYouInjured").setValue("");
			sap.ui.getCore().byId("InputWhatTaskWhenInjured").setValue("");
			sap.ui.getCore().byId("InputAreaOfWorksite").setValue("");
			sap.ui.getCore().byId("InputAddressofIncident").setValue("");
			sap.ui.getCore().byId("InputInjurySuburb").setValue("");
			sap.ui.getCore().byId("InputInjuryState").setSelectedKey("");
			sap.ui.getCore().byId("InputInjuryPostcode").setValue("");
			sap.ui.getCore().byId("InputEmployerResponsible").setValue("");
			sap.ui.getCore().byId("InputInjuryPoliceStationReported").setValue("");
			sap.ui.getCore().byId("InputRegNoOfVehicles").setValue("");
			sap.ui.getCore().byId("InputVehicleState").setSelectedKey("");
			sap.ui.getCore().byId("InputInjuryQue1").setValue("");
			sap.ui.getCore().byId("InputInjuryQue2").setValue("");
			sap.ui.getCore().byId("InputInjuryQue3").setValue("");
			sap.ui.getCore().byId("InputInjuryQue4").setValue("");
			sap.ui.getCore().byId("InputInjuryQue5").setValue("");
			sap.ui.getCore().byId("InputEmpNameOfOrg").setValue("");
			sap.ui.getCore().byId("InputEmpStreetAdd").setValue("");
			sap.ui.getCore().byId("InputEmpOrgState").setValue("");
			sap.ui.getCore().byId("InputEmpOrgSuburb").setValue("");
			sap.ui.getCore().byId("InputEmpOrgPostcode").setValue("");
			sap.ui.getCore().byId("InputEmpNameAndContact").setValue("");
			sap.ui.getCore().byId("InputEmpOccupation").setValue("");
			sap.ui.getCore().byId("InputEmpOtherEmployment").setValue("");
			sap.ui.getCore().byId("InputWorkerQue1").setValue("");
			sap.ui.getCore().byId("InputWorkerQue2").setValue("");
			sap.ui.getCore().byId("InputWorkerQue3").setValue("");
			sap.ui.getCore().byId("InputWorkerQue4").setValue("");
			sap.ui.getCore().byId("InputWorkerWeeklyShiftAllowence").setValue("");
			sap.ui.getCore().byId("InputWorkerWeeklyOvertime").setValue("");
			sap.ui.getCore().byId("InputReturToWorkQue1").setValue("");
			sap.ui.getCore().byId("InputReturToWorkOue2").setSelectedKey("");
			sap.ui.getCore().byId("InputReturToWorkOue3").setValue("");
			sap.ui.getCore().byId("InputReturToWorkOue4").setValue("");
			sap.ui.getCore().byId("InputReturToWorkOue5").setSelectedKey("");
			sap.ui.getCore().byId("InputInjuryDateTime").setValue("");
			sap.ui.getCore().byId("InputWhenNoticeInjury").setValue("");
			sap.ui.getCore().byId("InputStoppedWorkDateTIme").setValue("");
			sap.ui.getCore().byId("InputInjuryReportDateTime").setValue("");
			sap.ui.getCore().byId("InputDeclarationDate").setValue("");
			sap.ui.getCore().byId("InputEmpStartWorkingDate").setValue("");
			sap.ui.getCore().byId("InputReturToWorkDate").setValue("");
			sap.ui.getCore().byId("InputReturToWorkClaimFormSubmissionDate").setValue("");
			sap.ui.getCore().byId("InputReturToWorkMedicalCertificateSubmissionDate").setValue("");
		}

	});
});