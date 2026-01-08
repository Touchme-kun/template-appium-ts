@navigation
Feature: Application Navigation
  As a user
  I want to navigate through the application
  So that I can access different features

  Background:
    Given I launch the application
    And I am logged in as a valid user

  @smoke @P1
  Scenario: Navigate to main sections from home screen
    Given I am on the home screen
    When I tap on the menu button
    Then I should see the following menu items:
      | Menu Item    |
      | Profile      |
      | Settings     |
      | Notifications|
      | Help         |
      | Logout       |

  @P1
  Scenario Outline: Navigate to different sections
    Given I am on the home screen
    When I tap on "<menu_item>"
    Then I should be on the "<expected_screen>" screen
    And the screen title should be "<screen_title>"

    Examples:
      | menu_item     | expected_screen   | screen_title     |
      | Profile       | profile           | My Profile       |
      | Settings      | settings          | Settings         |
      | Notifications | notifications     | Notifications    |
      | Help          | help              | Help & Support   |

  @P2
  Scenario: Navigate back from nested screens
    Given I am on the home screen
    When I navigate to Profile
    And I tap on Edit Profile
    And I navigate back
    Then I should be on the "profile" screen
    When I navigate back
    Then I should be on the "home" screen

  @P2
  Scenario: Navigate using tab bar
    Given I am on the home screen
    Then I should see the bottom tab bar with:
      | Tab       |
      | Home      |
      | Search    |
      | Favorites |
      | Profile   |
    When I tap on "Search" tab
    Then I should be on the "search" screen
    When I tap on "Favorites" tab
    Then I should be on the "favorites" screen
    When I tap on "Home" tab
    Then I should be on the "home" screen

  @gesture @P2
  Scenario: Navigate using swipe gestures
    Given I am on a screen with multiple pages
    When I swipe left
    Then I should see the next page
    When I swipe right
    Then I should see the previous page

  @deeplink @P2
  Scenario Outline: Navigate via deep links
    Given the app is closed
    When I open deep link "<deep_link>"
    Then I should be on the "<expected_screen>" screen

    Examples:
      | deep_link                    | expected_screen |
      | myapp://profile              | profile         |
      | myapp://settings             | settings        |
      | myapp://product/12345        | product_detail  |
      | myapp://notifications        | notifications   |

  @accessibility @P3
  Scenario: Navigation with screen reader
    Given accessibility mode is enabled
    When I focus on the menu button
    Then I should hear "Menu button, double tap to open"
    When I double tap
    Then I should hear "Menu opened"
    And I should hear menu items announced

  @edge @P3
  Scenario: Handle navigation during network issues
    Given I am on the home screen
    When the network connection is lost
    And I tap on "Profile"
    Then I should see cached profile data
    And I should see text "Offline mode"

  @performance @P3
  Scenario: Navigation performance
    Given I am on the home screen
    When I measure navigation time to "Settings"
    Then the navigation should complete within 2 seconds

  @state @P2
  Scenario: Maintain state on navigation
    Given I am on the search screen
    When I enter search term "test query"
    And I navigate to "Profile"
    And I navigate back to "Search"
    Then the search term should still be "test query"
