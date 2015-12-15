Feature: Medical Record Numbers

  @mrn1
  Scenario: Manage a patient's medical record numbers
    When we visit the "patient" tab of a patient team
    Then we see a button to add an MRN

  @mrn2 @excludeFromReport
  Scenario: Patient can see his MRNs
    When a patient with MRNs looks at his own profile
    Then he can see his MRNs
     But he cannot delete or edit them

  @mrn3
  Scenario: Show a relevant patient MRN in the team header
    Given a patient with MRNs created by providers in different groups
     When a provider views her patient's team
     Then she sees only her group's MRN displayed in the team header
      But she can see every MRN from the team's "patient" tab