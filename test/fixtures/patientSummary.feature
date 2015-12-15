Feature: Team Patient Summary
  This is the feature description.
  Second line of description.

  @patientSummary1
  Scenario: Update the patient summary as a provider
    When we access a patient team summary as a provider
    Then the patient summary is empty

  @patientSummary2 @short
  Scenario: Request to update the patient summary as a patient
    When we access a patient team summary as a patient
    Then the patient summary is empty and does not say it will autosave

  @patientSummary3
  Scenario: View a patient summary updated by a different team member
    When we view a patient summary that was updated by another provider
    Then we see it was last updated by the other provider