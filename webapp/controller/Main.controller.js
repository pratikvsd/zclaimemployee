sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/Wizard-dbg",
	"sap/ui/Device",
	"sap/m/WizardProgressNavigator",
	"sap/m/WizardRenderer"
], function(Controller, UploadCollectionParameter, Device) {
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

		onCreateIncidentPress: function(oEvent) {
			var urlString = document.location.href.split("/");
			var host = urlString[2];
			window.open("https://" + host + "/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#CNet-MyIncidents", "_blank");
			//window.open("https://sapsdev.c-net.com.au/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html#CNet-MyIncidents", "_blank");
		}, //To open create incident app in new window.

		openPrivacyStatementTab: function() {
			this.ConfidentialColumnText = sap.ui.getCore().byId("injuryDetailsTable").getSelectedItem().getCells()[5].getText();
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
			sap.ui.getCore().byId("claimFormWizard")._getProgressNavigator().ontap = function() {};
			sap.ui.getCore().byId("claimFormWizard")._scrollHandler = function() {
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
					} else if (wizardStep === "personalDetailStep") {
						sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
					} else {
						sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
						sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(true);
					}
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

			sap.ui.getCore().byId("html").setContent("<canvas id='signature-pad' width='200px' height='200px' class='signature-pad'></canvas>");
			if (sap.ui.getCore().byId("claimFormWizard").getCurrentStep() === "personalDetailStep") {
				sap.ui.getCore().byId("claimWizardPrevBtn").setVisible(false);
			}
			this.PrivacyStatementDialog.close();
			this.InjuryTabDialog.close();
			sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
			sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);
			sap.ui.getCore().byId("injuryTabCreateIncBtn").setEnabled(false);

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
				var titleInput = sap.ui.getCore().byId("titleInput");
				var familyNameInput = sap.ui.getCore().byId("familyNameInput");
				var givenNameInput = sap.ui.getCore().byId("givenNameInput");

				if (titleInput.getValue() === "" || titleInput.getValue() === undefined) {
					titleInput.setValueState("Error");
				} else if (familyNameInput.getValue() === "" || familyNameInput.getValue() === undefined) {
					familyNameInput.setValueState("Error");
				} else if (givenNameInput.getValue() === "" || givenNameInput.getValue() === undefined) {
					givenNameInput.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}

			} else if (this._oWizard.getCurrentStep() === "injuryDetailStep") {
				var injuryDatePicker = sap.ui.getCore().byId("injuryDatePicker");
				var stoppedWorkDatePicker = sap.ui.getCore().byId("stoppedWorkDatePicker");
				if (injuryDatePicker.getValue() === "" || injuryDatePicker.getValue() === undefined) {
					injuryDatePicker.setValueState("Error");
				} else if (stoppedWorkDatePicker.getValue() === "" || stoppedWorkDatePicker.getValue() === undefined) {
					stoppedWorkDatePicker.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "employmentDetailStep") {
				var appliesToYouDropdown = sap.ui.getCore().byId("appliesToYouDropdown");
				if (appliesToYouDropdown.getValue() === "" || appliesToYouDropdown.getValue() === undefined) {
					appliesToYouDropdown.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "workerEarningStep") {
				var weeklyShiftInput = sap.ui.getCore().byId("weeklyShiftInput");
				var weeklyOvertimeInput = sap.ui.getCore().byId("weeklyOvertimeInput");
				if (weeklyShiftInput.getValue() === "" || weeklyShiftInput.getValue() === undefined) {
					weeklyShiftInput.setValueState("Error");
				} else if (weeklyOvertimeInput.getValue() === "" || weeklyOvertimeInput.getValue() === undefined) {
					weeklyOvertimeInput.setValueState("Error");
				} else {
					if (this._oSelectedStep && !this._oSelectedStep.bLast) {
						this._oWizard.goToStep(oNextStep, true);

					} else {
						this._oWizard.nextStep();
					}
				}
			} else if (this._oWizard.getCurrentStep() === "workerDecStep") {
				var canvas = document.getElementById("signature-pad");
				// roughString variable is used for storing the string of blank signature box and its used below for validation.
				var roughString =
					"ZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvNGdJb1NVTkRYMUJTVDBaSlRFVUFBUUVBQUFJWUFBQUFBQVF3QUFCdGJuUnlVa2RDSUZoWldpQUFBQUFBQUFBQUFBQUFBQUJoWTNOd0FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUE5dFlBQVFBQUFBRFRMUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBbGtaWE5qQUFBQThBQUFBSFJ5V0ZsYUFBQUJaQUFBQUJSbldGbGFBQUFCZUFBQUFCUmlXRmxhQUFBQmpBQUFBQlJ5VkZKREFBQUJvQUFBQUNoblZGSkRBQUFCb0FBQUFDaGlWRkpEQUFBQm9BQUFBQ2gzZEhCMEFBQUJ5QUFBQUJSamNISjBBQUFCM0FBQUFEeHRiSFZqQUFBQUFBQUFBQUVBQUFBTVpXNVZVd0FBQUZnQUFBQWNBSE1BVWdCSEFFSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFGaFpXaUFBQUFBQUFBQnZvZ0FBT1BVQUFBT1FXRmxhSUFBQUFBQUFBR0taQUFDM2hRQUFHTnBZV1ZvZ0FBQUFBQUFBSktBQUFBK0VBQUMyejNCaGNtRUFBQUFBQUFRQUFBQUNabVlBQVBLbkFBQU5XUUFBRTlBQUFBcGJBQUFBQUFBQUFBQllXVm9nQUFBQUFBQUE5dFlBQVFBQUFBRFRMVzFzZFdNQUFBQUFBQUFBQVFBQUFBeGxibFZUQUFBQUlBQUFBQndBUndCdkFHOEFad0JzQUdVQUlBQkpBRzRBWXdBdUFDQUFNZ0F3QURFQU52L2JBRU1BQXdJQ0FnSUNBd0lDQWdNREF3TUVCZ1FFQkFRRUNBWUdCUVlKQ0FvS0NRZ0pDUW9NRHd3S0N3NExDUWtORVEwT0R4QVFFUkFLREJJVEVoQVREeEFRRVAvYkFFTUJBd01EQkFNRUNBUUVDQkFMQ1FzUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFUC9BQUJFSUFNZ0F5QU1CSWdBQ0VRRURFUUgveEFBVkFBRUJBQUFBQUFBQUFBQUFBQUFBQUFBQUNmL0VBQlFRQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUQveEFBVUFRRUFBQUFBQUFBQUFBQUFBQUFBQUFBQS84UUFGQkVCQUFBQUFBQUFBQUFBQUFBQUFBQUFBUC9hQUF3REFRQUNFUU1SQUQ4QWxVQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUQvOWs9";
				this.signString = btoa(encodeURI(canvas.toDataURL('image/jpeg').replace("data:image/jpeg:base64,", "")));
				var declarationDatePicker = sap.ui.getCore().byId("declarationDatePicker");
				if (declarationDatePicker.getValue() === "" || declarationDatePicker.getValue() === undefined) {
					declarationDatePicker.setValueState("Error");
				} else if (roughString === this.signString) {
					canvas.style.borderColor = "red";
				} else {
					console.log(this.signString);
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
			if (oEvent.getSource().getParent().getId() === "confidentialPopupDialog") {
				oEvent.getSource().getParent().close();
			} else if (this.WizardTitle === "StartClaim") {
				this.claimWizardDialog.close();
				sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
				sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
				sap.ui.getCore().byId("claimFormWizard").setCurrentStep("personalDetailStep");
				this.WizardTitle = "InjuryTab";
			} else if (this.WizardTitle === "InjuryTab") {
				this.InjuryTabDialog.close();
				sap.ui.getCore().byId("injuryDetailsTable").removeSelections();
				sap.ui.getCore().byId("injuryTabStartBtn").setEnabled(false);
				sap.ui.getCore().byId("injuryTabCreateIncBtn").setEnabled(false);

			} else if (this.WizardTitle === "PrivacyDialog") {
				this.PrivacyStatementDialog.close();
				this.WizardTitle = "InjuryTab";
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
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments(" + aItems.length + ")");

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
			sap.ui.getCore().byId("UploadCollection").setNumberOfAttachmentsText("Employee Attachments(" + Items.length + ")");
		}, // To delete the files from the attchment list.

		onPressSubmitButton: function() {
			if (!this.oApproveDialog) {
				this.oApproveDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Confirm",
					content: new sap.m.Text({
						text: "Do you want to submit this claim?"
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Submit",
						press: function() {
							this.oApproveDialog.close();
							var sSource = sap.ui.require.toUrl("safetysuitezclaimemployee/Attachment_Sample_Files/2056106_E_20220914.pdf");
							this.claimWizardDialog.close();
							sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
							sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
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
						press: function() {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();

		}, // Submit button functionality

		onPressSaveDraftButton: function() {
			sap.m.MessageToast.show("Claim has been saved as draft");
			this.claimWizardDialog.close();
			sap.ui.getCore().byId("claimWizardNextBtn").setVisible(true);
			sap.ui.getCore().byId("claimSubmitBtn").setEnabled(false);
			this._oWizard.setCurrentStep("personalDetailStep");
		}, // Save as draft button functionality

		onSign: function() {
			var canvas = document.getElementById("signature-pad");
			var context = canvas.getContext("2d");
			canvas.width = 200;
			canvas.height = 200;
			context.fillStyle = "#fff";
			context.strokeStyle = "#444";
			context.lineWidth = 1.5;
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

			/*var signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
				  backgroundColor: '#ffffff',
				  penColor: 'rgb(0, 0, 0)',
				  penWidth : '1'
			})*/
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
		}

	});
});