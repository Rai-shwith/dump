#!/bin/bash
echo "Manual Testing Instructions for TASK-018:"
echo "Test 1 — Delete public clipboard: View clipboard -> click delete -> redirected to home"
echo "Test 2 — Delete protected clipboard with owner token: -> deleted without password prompt"
echo "Test 3 — Delete protected clipboard without owner token: -> password prompt shown, Wrong password -> error, Correct password -> deleted"
echo "Test 4 — Edit content: Click edit -> change content -> submit -> content updated on page"
echo "Test 5 — Edit expiration: Change expiration -> submit -> expiration updated and displayed correctly in local timezone"
echo "Please perform these tests manually in your browser."
