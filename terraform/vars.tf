variable "public_key_path" {
  description = "Path to public key"
}

variable "environment" {
  description = "Name of environment"
}

variable "key_name" {
  description = "Desired name of AWS key pair"
}

variable "aws_region" {
  description = "AWS region to launch servers."
  default = "us-west-2"
}

# Ubuntu Trusty 14.04 HVM x86_64
variable "aws_amis" {
  default = {
    us-west-2 = "ami-63ac5803"
  }
}
