from __future__ import annotations


class DomainError(Exception):
    code = "domain_error"

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class DomainValidationError(DomainError):
    code = "validation_error"


ValidationError = DomainValidationError


class NotFound(DomainError):
    code = "not_found"

    def __init__(self, resource: str, identifier: str):
        super().__init__(f"{resource} '{identifier}' was not found.")
        self.resource = resource
        self.identifier = identifier


class Conflict(DomainError):
    code = "conflict"


class Forbidden(DomainError):
    code = "forbidden"
