@registration @smoke
Feature: User Registration
  As a new user
  I want to register an account
  So that I can access the application features

  Background:
    Given I launch the application

  @positive @P1
  Scenario: Successful registration with valid details
    Given I am on the registration screen
    When I enter the following registration details:
      | Field           | Value                    |
      | First Name      | John                     |
      | Last Name       | Doe                      |
      | Email           | john.doe@example.com     |
      | Password        | SecurePass123!           |
      | Confirm Password| SecurePass123!           |
    And I accept the terms and conditions
    And I tap the register button
    Then I should see the welcome screen
    And I should see text "Welcome, John"

  @positive @P2
  Scenario Outline: Registration with various valid emails
    Given I am on the registration screen
    When I enter email "<email>"
    And I enter password "ValidPass123!"
    And I complete registration
    Then I should see the welcome screen

    Examples:
      | email                      |
      | user@domain.com            |
      | user.name@domain.com       |
      | user+tag@domain.co.uk      |
      | user123@subdomain.domain.org |

  @negative @validation @P1
  Scenario: Registration with empty required fields
    Given I am on the registration screen
    When I tap the register button
    Then I should see error message "First Name is required"
    And I should see error message "Last Name is required"
    And I should see error message "Email is required"
    And I should see error message "Password is required"

  @negative @validation @P2
  Scenario Outline: Registration with invalid email format
    Given I am on the registration screen
    When I enter email "<invalid_email>"
    And I enter password "ValidPass123!"
    And I tap the register button
    Then I should see error message "Please enter a valid email address"

    Examples:
      | invalid_email     |
      | invalid           |
      | @nodomain.com     |
      | user@             |
      | user@.com         |
      | user space@domain |

  @negative @validation @P2
  Scenario Outline: Registration with weak password
    Given I am on the registration screen
    When I enter email "test@example.com"
    And I enter password "<weak_password>"
    And I tap the register button
    Then I should see error message "<error_message>"

    Examples:
      | weak_password | error_message                           |
      | 123           | Password must be at least 8 characters  |
      | password      | Password must contain a number          |
      | 12345678      | Password must contain a letter          |
      | Pass1234      | Password must contain a special character|

  @negative @P2
  Scenario: Registration with mismatched passwords
    Given I am on the registration screen
    When I enter password "SecurePass123!"
    And I enter confirm password "DifferentPass123!"
    And I tap the register button
    Then I should see error message "Passwords do not match"

  @negative @P3
  Scenario: Registration with existing email
    Given I am on the registration screen
    When I enter the following registration details:
      | Field      | Value                    |
      | Email      | existing@example.com     |
      | Password   | SecurePass123!           |
    And I tap the register button
    Then I should see error message "Email already registered"

  @boundary @P3
  Scenario Outline: Registration with boundary value inputs
    Given I am on the registration screen
    When I enter first name with <name_length> characters
    And I complete registration with valid details
    Then I should see "<expected_result>"

    Examples:
      | name_length | expected_result           |
      | 1           | welcome screen            |
      | 50          | welcome screen            |
      | 51          | maximum length exceeded   |
      | 100         | maximum length exceeded   |

  @integration @P2
  Scenario: Registration with email verification
    Given I am on the registration screen
    When I enter the following registration details:
      | Field    | Value                    |
      | Email    | verify@example.com       |
      | Password | SecurePass123!           |
    And I tap the register button
    Then I should see text "Verification email sent"
    And I should see text "Please check your inbox"
