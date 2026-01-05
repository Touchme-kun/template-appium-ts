@smoke @android @ios
Feature: User Login
  As a mobile app user
  I want to log in to the application
  So that I can access my account

  Background:
    Given I am on the login screen

  @critical
  Scenario: Successful login with valid credentials
    When I enter username "testuser@example.com"
    And I enter password "SecurePass123"
    And I tap the login button
    Then I should see the home screen
    And I should see welcome message "Welcome back!"

  @regression
  Scenario: Login with invalid password
    When I enter username "testuser@example.com"
    And I enter password "wrongpassword"
    And I tap the login button
    Then I should see error message "Invalid credentials"

  @regression
  Scenario: Login with invalid username
    When I enter username "invalid@example.com"
    And I enter password "SecurePass123"
    And I tap the login button
    Then I should see error message "Invalid credentials"

  @regression
  Scenario Outline: Login with various invalid credentials
    When I enter username "<username>"
    And I enter password "<password>"
    And I tap the login button
    Then I should see error message "<error>"

    Examples:
      | username              | password        | error                    |
      | invalid@example.com   | wrong123        | Invalid credentials      |
      |                       | SecurePass123   | Username is required     |
      | testuser@example.com  |                 | Password is required     |
      | invalid-email         | SecurePass123   | Invalid email format     |

  @smoke
  Scenario: Forgot password navigation
    When I tap the forgot password link
    Then I should see the forgot password screen

  @smoke
  Scenario: Sign up navigation
    When I tap the sign up link
    Then I should see the sign up screen
